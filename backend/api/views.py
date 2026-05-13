from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .admin_serializers import (
    AdminCategorySerializer,
    AdminContactMessageSerializer,
    AdminCustomerSerializer,
    AdminOrderSerializer,
    AdminOrderStatusSerializer,
    AdminProductSerializer,
    AdminReviewSerializer,
    AdminUserSerializer,
    AdminWishlistItemSerializer,
)
from .models import Category, ContactMessage, Customer, Order, Product, Review, WishlistItem
from .serializers import (
    CategorySerializer,
    ContactMessageSerializer,
    OrderCreateSerializer,
    OrderSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ReviewCreateSerializer,
    WishlistItemSerializer,
)

User = get_user_model()


class HealthCheckView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response({"status": "ok", "service": "tanit-cuisine-api"})


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = "slug"


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = "slug"

    def get_queryset(self):
        queryset = (
            Product.objects.filter(is_available=True, category__is_active=True)
            .select_related("category")
            .prefetch_related("pairings", "reviews")
        )

        category = self.request.query_params.get("category")
        query = self.request.query_params.get("q")
        price_max = self.request.query_params.get("price_max")
        spice_max = self.request.query_params.get("spice_max")
        dietary = self.request.query_params.get("dietary")
        sort = self.request.query_params.get("sort", "relevance")

        if category:
            queryset = queryset.filter(category__slug=category)
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query)
                | Q(short_description__icontains=query)
                | Q(description__icontains=query)
                | Q(ingredients__icontains=query)
                | Q(dietary__icontains=query)
            )
        if price_max:
            queryset = queryset.filter(price__lte=price_max)
        if spice_max:
            queryset = queryset.filter(spice_level__lte=spice_max)
        if dietary:
            for tag in [item.strip() for item in dietary.split(",") if item.strip()]:
                queryset = queryset.filter(dietary__icontains=tag)

        ordering = {
            "price-asc": ("price", "sort_order", "name"),
            "price-desc": ("-price", "sort_order", "name"),
            "rating": ("-rating", "-review_count", "sort_order", "name"),
            "newest": ("-is_new", "sort_order", "name"),
            "relevance": ("-featured", "-bestseller", "sort_order", "name"),
        }
        return queryset.order_by(*ordering.get(sort, ordering["relevance"]))

    def get_serializer_class(self):
        if self.action == "reviews":
            return ReviewCreateSerializer
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer

    def get_permissions(self):
        if self.action == "reviews":
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    @action(detail=False, methods=["get"])
    def featured(self, request):
        queryset = self.get_queryset().filter(featured=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="bestsellers")
    def bestsellers(self, request):
        queryset = self.get_queryset().filter(bestseller=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="new")
    def new_products(self, request):
        queryset = self.get_queryset().filter(is_new=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="reviews")
    def reviews(self, request, slug=None):
        product = self.get_object()
        serializer = self.get_serializer(data=request.data, context={"request": request, "product": product})
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        return Response(serializer.to_representation(review), status=status.HTTP_201_CREATED)


class OrderViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Order.objects.prefetch_related("items").select_related("customer")
    lookup_field = "order_number"
    lookup_url_kwarg = "order_number"

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        return OrderSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == "retrieve" and self.request.user.is_authenticated:
            return queryset.filter(Q(user=self.request.user) | Q(user__isnull=True))
        return queryset


class ContactMessageViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer


class WishlistItemViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    serializer_class = WishlistItemSerializer

    def get_queryset(self):
        queryset = WishlistItem.objects.select_related("product", "product__category")
        if self.request.user.is_authenticated:
            return queryset.filter(user=self.request.user)
        session_key = self.request.query_params.get("sessionKey", "")
        if not session_key:
            return queryset.none()
        return queryset.filter(session_key=session_key)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        return Response(self.get_serializer(item).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["delete"], url_path=r"product/(?P<product_id>[^/.]+)")
    def remove_product(self, request, product_id=None):
        deleted, _ = self.get_queryset().filter(product__external_id=product_id).delete()
        return Response({"removed": deleted > 0})


class AdminSummaryView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        revenue = Order.objects.exclude(status=Order.Status.CANCELLED).aggregate(total=Sum("total"))["total"] or 0
        recent_orders = Order.objects.select_related("user").prefetch_related("items").order_by("-created_at")[:5]
        return Response(
            {
                "counts": {
                    "orders": Order.objects.count(),
                    "pendingOrders": Order.objects.filter(status=Order.Status.PENDING).count(),
                    "contactMessages": ContactMessage.objects.count(),
                    "newContactMessages": ContactMessage.objects.filter(status=ContactMessage.Status.NEW).count(),
                    "wishlistItems": WishlistItem.objects.count(),
                    "products": Product.objects.count(),
                    "customers": Customer.objects.count(),
                    "reviews": Review.objects.count(),
                    "visibleReviews": Review.objects.filter(is_visible=True).count(),
                    "users": User.objects.count(),
                },
                "revenue": revenue,
                "topProducts": list(
                    Product.objects.annotate(orderCount=Count("order_items"))
                    .order_by("-orderCount", "name")
                    .values("name", "slug", "external_id", "orderCount")[:5]
                ),
                "recentOrders": AdminOrderSerializer(recent_orders, many=True).data,
            }
        )


class AdminCategoryViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminCategorySerializer
    queryset = Category.objects.all().order_by("sort_order", "name")


class AdminProductViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminProductSerializer
    queryset = Product.objects.select_related("category").all().order_by("sort_order", "name")

    def get_queryset(self):
        queryset = super().get_queryset()
        query = self.request.query_params.get("q")
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query)
                | Q(slug__icontains=query)
                | Q(external_id__icontains=query)
                | Q(category__name__icontains=query)
            )
        return queryset

    def partial_update(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            submitted = set(request.data.keys())
            if submitted - {"isAvailable"}:
                return Response(
                    {"detail": "Staff users can only update product availability."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        response = super().partial_update(request, *args, **kwargs)
        response.data = self.get_serializer(self.get_object()).data
        return response


class AdminOrderViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    permission_classes = [permissions.IsAdminUser]
    queryset = Order.objects.select_related("customer", "user").prefetch_related("items").order_by("-created_at")

    def get_serializer_class(self):
        if self.action in {"update", "partial_update"}:
            return AdminOrderStatusSerializer
        return AdminOrderSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get("status")
        query = self.request.query_params.get("q")
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if query:
            queryset = queryset.filter(
                Q(order_number__icontains=query)
                | Q(full_name__icontains=query)
                | Q(email__icontains=query)
                | Q(phone__icontains=query)
            )
        return queryset

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        response.data = AdminOrderSerializer(self.get_object()).data
        return response


class AdminContactMessageViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminContactMessageSerializer
    queryset = ContactMessage.objects.all().order_by("-created_at")

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get("status")
        query = self.request.query_params.get("q")
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query)
                | Q(email__icontains=query)
                | Q(topic__icontains=query)
                | Q(message__icontains=query)
            )
        return queryset


class AdminReviewViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminReviewSerializer
    queryset = Review.objects.select_related("product", "user").order_by("-created_at")

    def get_queryset(self):
        queryset = super().get_queryset()
        query = self.request.query_params.get("q")
        if query:
            queryset = queryset.filter(
                Q(product__name__icontains=query)
                | Q(author__icontains=query)
                | Q(title__icontains=query)
                | Q(comment__icontains=query)
            )
        return queryset


class AdminWishlistItemViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminWishlistItemSerializer
    queryset = WishlistItem.objects.select_related("product", "product__category", "user").order_by("-created_at")


class AdminCustomerViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminCustomerSerializer
    queryset = Customer.objects.annotate(order_total=Count("orders")).order_by("-created_at")


class AdminUserViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    serializer_class = AdminUserSerializer
    queryset = User.objects.all().order_by("-date_joined")

    def get_permissions(self):
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        if not self.request.user.is_superuser:
            return User.objects.none()
        query = self.request.query_params.get("q")
        queryset = super().get_queryset()
        if query:
            queryset = queryset.filter(Q(email__icontains=query) | Q(full_name__icontains=query))
        return queryset

    def partial_update(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            return Response({"detail": "Only superusers can manage user access."}, status=status.HTTP_403_FORBIDDEN)
        response = super().partial_update(request, *args, **kwargs)
        response.data = self.get_serializer(self.get_object()).data
        return response
