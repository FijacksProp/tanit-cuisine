from django.db.models import Q
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, ContactMessage, Order, Product, WishlistItem
from .serializers import (
    CategorySerializer,
    ContactMessageSerializer,
    OrderCreateSerializer,
    OrderSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    WishlistItemSerializer,
)


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
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer

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


class OrderViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Order.objects.prefetch_related("items").select_related("customer")
    lookup_field = "order_number"
    lookup_url_kwarg = "order_number"

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        return OrderSerializer


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
