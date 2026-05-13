from django.contrib import admin

from .models import Category, ContactMessage, Customer, Order, OrderItem, Product, Review, WishlistItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "sort_order", "is_active")
    list_filter = ("is_active",)
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "tagline", "description")
    ordering = ("sort_order", "name")


class ReviewInline(admin.TabularInline):
    model = Review
    extra = 0
    fields = ("author", "rating", "title", "reviewed_at", "verified", "is_visible")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "external_id",
        "category",
        "price",
        "spice_level",
        "featured",
        "bestseller",
        "is_new",
        "is_available",
    )
    list_filter = ("category", "featured", "bestseller", "is_new", "is_available", "spice_level")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "external_id", "slug", "short_description", "description")
    filter_horizontal = ("pairings",)
    inlines = [ReviewInline]
    ordering = ("sort_order", "name")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("title", "product", "author", "rating", "reviewed_at", "verified", "is_visible")
    list_filter = ("rating", "verified", "is_visible", "reviewed_at")
    search_fields = ("title", "comment", "author", "product__name")


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        "product",
        "product_external_id",
        "product_slug",
        "product_name",
        "unit_price",
        "quantity",
        "notes",
        "line_total",
    )
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("order_number", "full_name", "phone", "delivery", "payment", "status", "total", "created_at")
    list_filter = ("status", "delivery", "payment", "created_at")
    search_fields = ("order_number", "full_name", "email", "phone")
    readonly_fields = ("order_number", "subtotal", "delivery_fee", "service_fee", "total", "created_at", "updated_at")
    inlines = [OrderItemInline]


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "phone", "created_at")
    search_fields = ("full_name", "email", "phone")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "topic", "status", "created_at")
    list_filter = ("topic", "status", "created_at")
    search_fields = ("name", "email", "message")


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ("product", "user", "session_key", "created_at")
    search_fields = ("product__name", "user__email", "session_key")
