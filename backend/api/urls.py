from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminCategoryViewSet,
    AdminContactMessageViewSet,
    AdminCustomerViewSet,
    AdminOrderViewSet,
    AdminProductViewSet,
    AdminReviewViewSet,
    AdminSummaryView,
    AdminUserViewSet,
    AdminWishlistItemViewSet,
    CategoryViewSet,
    ContactMessageViewSet,
    HealthCheckView,
    OrderViewSet,
    ProductViewSet,
    WishlistItemViewSet,
)

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")
router.register("orders", OrderViewSet, basename="order")
router.register("contact", ContactMessageViewSet, basename="contact")
router.register("wishlist", WishlistItemViewSet, basename="wishlist")
router.register("admin/categories", AdminCategoryViewSet, basename="admin-category")
router.register("admin/products", AdminProductViewSet, basename="admin-product")
router.register("admin/orders", AdminOrderViewSet, basename="admin-order")
router.register("admin/contact", AdminContactMessageViewSet, basename="admin-contact")
router.register("admin/reviews", AdminReviewViewSet, basename="admin-review")
router.register("admin/wishlist", AdminWishlistItemViewSet, basename="admin-wishlist")
router.register("admin/customers", AdminCustomerViewSet, basename="admin-customer")
router.register("admin/users", AdminUserViewSet, basename="admin-user")

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health-check"),
    path("admin/summary/", AdminSummaryView.as_view(), name="admin-summary"),
    path("", include(router.urls)),
]
