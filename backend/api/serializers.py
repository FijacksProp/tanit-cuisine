from __future__ import annotations

import time

from django.db import transaction
from rest_framework import serializers

from .models import (
    Category,
    ContactMessage,
    Customer,
    Order,
    OrderItem,
    Product,
    Review,
    WishlistItem,
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["slug", "name", "tagline", "description", "image"]


class ReviewSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="external_id")
    date = serializers.DateField(source="reviewed_at", format="%B %d, %Y")

    class Meta:
        model = Review
        fields = ["id", "author", "initials", "rating", "date", "title", "comment", "verified"]


class ProductListSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="external_id")
    category = serializers.SlugRelatedField(read_only=True, slug_field="slug")
    oldPrice = serializers.IntegerField(source="old_price")
    shortDescription = serializers.CharField(source="short_description")
    spiceLevel = serializers.IntegerField(source="spice_level")
    prepTimeMinutes = serializers.IntegerField(source="prep_time_minutes")
    servingSize = serializers.CharField(source="serving_size")
    rating = serializers.FloatField()
    reviewCount = serializers.IntegerField(source="review_count")
    isNew = serializers.BooleanField(source="is_new")
    pairings = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "slug",
            "name",
            "category",
            "price",
            "oldPrice",
            "shortDescription",
            "description",
            "image",
            "ingredients",
            "dietary",
            "spiceLevel",
            "prepTimeMinutes",
            "servingSize",
            "calories",
            "rating",
            "reviewCount",
            "featured",
            "isNew",
            "bestseller",
            "pairings",
        ]

    def get_pairings(self, obj: Product) -> list[str]:
        return list(obj.pairings.filter(is_available=True).values_list("slug", flat=True))


class ProductDetailSerializer(ProductListSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ["reviews"]


class OrderItemInputSerializer(serializers.Serializer):
    productId = serializers.CharField()
    quantity = serializers.IntegerField(min_value=1)
    notes = serializers.CharField(required=False, allow_blank=True)


class OrderItemSerializer(serializers.ModelSerializer):
    productId = serializers.CharField(source="product_external_id")
    productSlug = serializers.CharField(source="product_slug")
    productName = serializers.CharField(source="product_name")
    unitPrice = serializers.IntegerField(source="unit_price")
    lineTotal = serializers.IntegerField(source="line_total")

    class Meta:
        model = OrderItem
        fields = ["productId", "productSlug", "productName", "unitPrice", "quantity", "notes", "lineTotal"]


class OrderSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source="full_name")
    deliveryFee = serializers.IntegerField(source="delivery_fee", read_only=True)
    serviceFee = serializers.IntegerField(source="service_fee", read_only=True)
    orderNumber = serializers.CharField(source="order_number", read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "orderNumber",
            "fullName",
            "email",
            "phone",
            "address",
            "city",
            "state",
            "zip",
            "notes",
            "delivery",
            "payment",
            "status",
            "subtotal",
            "deliveryFee",
            "serviceFee",
            "total",
            "items",
            "created_at",
        ]


class OrderCreateSerializer(serializers.Serializer):
    fullName = serializers.CharField(max_length=160)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=40)
    address = serializers.CharField(max_length=255, required=False, allow_blank=True)
    city = serializers.CharField(max_length=80, required=False, allow_blank=True, default="Ilorin")
    state = serializers.CharField(max_length=80, required=False, allow_blank=True, default="Kwara")
    zip = serializers.CharField(max_length=20, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    delivery = serializers.ChoiceField(choices=Order.DeliveryMethod.choices, default=Order.DeliveryMethod.STANDARD)
    payment = serializers.ChoiceField(choices=Order.PaymentMethod.choices, default=Order.PaymentMethod.CARD)
    items = OrderItemInputSerializer(many=True, allow_empty=False)

    def validate(self, attrs):
        if attrs["delivery"] != Order.DeliveryMethod.PICKUP and not attrs.get("address", "").strip():
            raise serializers.ValidationError({"address": "Delivery address is required."})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        item_inputs = validated_data.pop("items")
        product_ids = [item["productId"] for item in item_inputs]
        products = Product.objects.in_bulk(product_ids, field_name="external_id")

        missing = [product_id for product_id in product_ids if product_id not in products]
        if missing:
            raise serializers.ValidationError({"items": f"Unknown product id(s): {', '.join(missing)}"})

        subtotal = sum(products[item["productId"]].price * item["quantity"] for item in item_inputs)
        delivery = validated_data["delivery"]
        delivery_fee = self.get_delivery_fee(delivery, subtotal)
        service_fee = round(subtotal * 0.025)
        total = subtotal + delivery_fee + service_fee

        customer, _ = Customer.objects.get_or_create(
            email=validated_data["email"],
            phone=validated_data["phone"],
            defaults={"full_name": validated_data["fullName"]},
        )
        if customer.full_name != validated_data["fullName"]:
            customer.full_name = validated_data["fullName"]
            customer.save(update_fields=["full_name", "updated_at"])

        order = Order.objects.create(
            order_number=self.generate_order_number(),
            customer=customer,
            full_name=validated_data["fullName"],
            email=validated_data["email"],
            phone=validated_data["phone"],
            address=validated_data.get("address", ""),
            city=validated_data.get("city", ""),
            state=validated_data.get("state", ""),
            zip=validated_data.get("zip", ""),
            notes=validated_data.get("notes", ""),
            delivery=delivery,
            payment=validated_data["payment"],
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            service_fee=service_fee,
            total=total,
        )

        for item in item_inputs:
            product = products[item["productId"]]
            quantity = item["quantity"]
            OrderItem.objects.create(
                order=order,
                product=product,
                product_external_id=product.external_id,
                product_slug=product.slug,
                product_name=product.name,
                unit_price=product.price,
                quantity=quantity,
                notes=item.get("notes", ""),
                line_total=product.price * quantity,
            )

        return order

    @staticmethod
    def get_delivery_fee(delivery: str, subtotal: int) -> int:
        if delivery == Order.DeliveryMethod.PICKUP:
            return 0
        if subtotal >= 25000:
            return 0
        return 4500 if delivery == Order.DeliveryMethod.EXPRESS else 2500

    @staticmethod
    def generate_order_number() -> str:
        base = f"TC-{str(int(time.time() * 1000))[-8:]}"
        candidate = base
        suffix = 1
        while Order.objects.filter(order_number=candidate).exists():
            candidate = f"{base}-{suffix}"
            suffix += 1
        return candidate

    def to_representation(self, instance):
        return OrderSerializer(instance, context=self.context).data


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "topic", "message", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    productId = serializers.CharField(write_only=True)
    sessionKey = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = WishlistItem
        fields = ["id", "product", "productId", "sessionKey", "created_at"]
        read_only_fields = ["id", "product", "created_at"]

    def validate_productId(self, value):
        if not Product.objects.filter(external_id=value, is_available=True).exists():
            raise serializers.ValidationError("Unknown product id.")
        return value

    def validate(self, attrs):
        request = self.context["request"]
        if not request.user.is_authenticated and not attrs.get("sessionKey", "").strip():
            raise serializers.ValidationError({"sessionKey": "A session key is required for guest wishlists."})
        return attrs

    def create(self, validated_data):
        product_id = validated_data.pop("productId")
        session_key = validated_data.pop("sessionKey", "")
        product = Product.objects.get(external_id=product_id)
        user = self.context["request"].user
        if not user.is_authenticated:
            user = None
        item, _ = WishlistItem.objects.get_or_create(
            user=user,
            session_key=session_key if user is None else "",
            product=product,
        )
        return item
