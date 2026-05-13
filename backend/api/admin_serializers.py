from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Category, ContactMessage, Customer, Order, Product, Review, WishlistItem
from .serializers import OrderItemSerializer, ProductListSerializer

User = get_user_model()


class AdminCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "slug", "name", "tagline", "is_active"]


class AdminProductSerializer(serializers.ModelSerializer):
    externalId = serializers.CharField(source="external_id")
    category = serializers.SlugRelatedField(queryset=Category.objects.all(), slug_field="slug")
    oldPrice = serializers.IntegerField(source="old_price", required=False, allow_null=True)
    shortDescription = serializers.CharField(source="short_description")
    spiceLevel = serializers.IntegerField(source="spice_level")
    prepTimeMinutes = serializers.IntegerField(source="prep_time_minutes")
    servingSize = serializers.CharField(source="serving_size")
    reviewCount = serializers.IntegerField(source="review_count", read_only=True)
    isNew = serializers.BooleanField(source="is_new", required=False)
    isAvailable = serializers.BooleanField(source="is_available", required=False)

    class Meta:
        model = Product
        fields = [
            "id",
            "externalId",
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
            "isAvailable",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "rating", "reviewCount", "created_at", "updated_at"]


class AdminOrderSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source="full_name")
    orderNumber = serializers.CharField(source="order_number")
    deliveryFee = serializers.IntegerField(source="delivery_fee")
    serviceFee = serializers.IntegerField(source="service_fee")
    userEmail = serializers.EmailField(source="user.email", read_only=True, allow_null=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "orderNumber",
            "userEmail",
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
            "updated_at",
        ]
        read_only_fields = fields


class AdminOrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["status"]


class AdminContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "topic", "message", "status", "created_at", "updated_at"]
        read_only_fields = ["id", "name", "email", "topic", "message", "created_at", "updated_at"]


class AdminCustomerSerializer(serializers.ModelSerializer):
    orderCount = serializers.IntegerField(source="orders.count", read_only=True)

    class Meta:
        model = Customer
        fields = ["id", "full_name", "email", "phone", "orderCount", "created_at", "updated_at"]
        read_only_fields = fields


class AdminReviewSerializer(serializers.ModelSerializer):
    productName = serializers.CharField(source="product.name", read_only=True)
    productSlug = serializers.CharField(source="product.slug", read_only=True)
    userEmail = serializers.EmailField(source="user.email", read_only=True, allow_null=True)
    isVisible = serializers.BooleanField(source="is_visible", required=False)
    reviewedAt = serializers.DateField(source="reviewed_at", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "external_id",
            "productName",
            "productSlug",
            "userEmail",
            "author",
            "initials",
            "rating",
            "reviewedAt",
            "title",
            "comment",
            "verified",
            "isVisible",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "external_id",
            "productName",
            "productSlug",
            "userEmail",
            "author",
            "initials",
            "rating",
            "reviewedAt",
            "title",
            "comment",
            "verified",
            "created_at",
            "updated_at",
        ]


class AdminWishlistItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    userEmail = serializers.EmailField(source="user.email", read_only=True, allow_null=True)
    sessionKey = serializers.CharField(source="session_key", read_only=True)

    class Meta:
        model = WishlistItem
        fields = ["id", "product", "userEmail", "sessionKey", "created_at", "updated_at"]
        read_only_fields = fields


class AdminUserSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source="full_name")
    isEmailVerified = serializers.BooleanField(source="is_email_verified")
    isStaff = serializers.BooleanField(source="is_staff")
    isSuperuser = serializers.BooleanField(source="is_superuser", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "fullName",
            "phone",
            "city",
            "state",
            "is_active",
            "isEmailVerified",
            "isStaff",
            "isSuperuser",
            "date_joined",
        ]
        read_only_fields = ["id", "email", "fullName", "phone", "city", "state", "isSuperuser", "date_joined"]
