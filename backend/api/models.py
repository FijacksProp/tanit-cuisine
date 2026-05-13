from django.conf import settings
from django.db import models
from django.db.models import Avg


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Category(TimeStampedModel):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=120)
    tagline = models.CharField(max_length=160)
    description = models.TextField()
    image = models.CharField(max_length=255)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name_plural = "categories"

    def __str__(self) -> str:
        return self.name


class Product(TimeStampedModel):
    class SpiceLevel(models.IntegerChoices):
        NONE = 0, "No heat"
        MILD = 1, "Mild"
        MEDIUM = 2, "Medium"
        HOT = 3, "Hot"

    external_id = models.CharField(max_length=32, unique=True)
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=160)
    category = models.ForeignKey(Category, related_name="products", on_delete=models.PROTECT)
    price = models.PositiveIntegerField()
    old_price = models.PositiveIntegerField(null=True, blank=True)
    short_description = models.TextField()
    description = models.TextField()
    image = models.CharField(max_length=255)
    ingredients = models.JSONField(default=list, blank=True)
    dietary = models.JSONField(default=list, blank=True)
    spice_level = models.PositiveSmallIntegerField(choices=SpiceLevel.choices, default=SpiceLevel.NONE)
    prep_time_minutes = models.PositiveIntegerField(default=0)
    serving_size = models.CharField(max_length=80)
    calories = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0)
    review_count = models.PositiveIntegerField(default=0)
    featured = models.BooleanField(default=False)
    is_new = models.BooleanField(default=False)
    bestseller = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    pairings = models.ManyToManyField("self", symmetrical=False, blank=True, related_name="paired_by")

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self) -> str:
        return self.name

    def refresh_review_stats(self) -> None:
        stats = self.reviews.filter(is_visible=True).aggregate(avg=Avg("rating"))
        count = self.reviews.filter(is_visible=True).count()
        self.rating = round(stats["avg"] or 0, 1)
        self.review_count = count
        self.save(update_fields=["rating", "review_count", "updated_at"])


class Review(TimeStampedModel):
    product = models.ForeignKey(Product, related_name="reviews", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="reviews", null=True, blank=True, on_delete=models.SET_NULL)
    order_item = models.ForeignKey("OrderItem", related_name="reviews", null=True, blank=True, on_delete=models.SET_NULL)
    external_id = models.CharField(max_length=64, unique=True)
    author = models.CharField(max_length=120)
    initials = models.CharField(max_length=8)
    rating = models.PositiveSmallIntegerField()
    reviewed_at = models.DateField()
    title = models.CharField(max_length=160)
    comment = models.TextField()
    verified = models.BooleanField(default=True)
    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ["-reviewed_at", "-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["product", "user"],
                condition=models.Q(user__isnull=False),
                name="unique_user_product_review",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.product.name} - {self.author}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.product.refresh_review_stats()

    def delete(self, *args, **kwargs):
        product = self.product
        result = super().delete(*args, **kwargs)
        product.refresh_review_stats()
        return result


class Customer(TimeStampedModel):
    full_name = models.CharField(max_length=160)
    email = models.EmailField()
    phone = models.CharField(max_length=40)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.full_name} <{self.email}>"


class Order(TimeStampedModel):
    class DeliveryMethod(models.TextChoices):
        STANDARD = "standard", "Standard"
        EXPRESS = "express", "Express"
        PICKUP = "pickup", "Pickup"

    class PaymentMethod(models.TextChoices):
        CARD = "card", "Card"
        TRANSFER = "transfer", "Bank transfer"
        CASH = "cash", "Cash on delivery"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        PREPARING = "preparing", "Preparing"
        OUT_FOR_DELIVERY = "out_for_delivery", "Out for delivery"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    order_number = models.CharField(max_length=24, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="orders", null=True, blank=True, on_delete=models.SET_NULL)
    customer = models.ForeignKey(Customer, related_name="orders", null=True, blank=True, on_delete=models.SET_NULL)
    full_name = models.CharField(max_length=160)
    email = models.EmailField()
    phone = models.CharField(max_length=40)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=80, blank=True)
    state = models.CharField(max_length=80, blank=True)
    zip = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    delivery = models.CharField(max_length=20, choices=DeliveryMethod.choices, default=DeliveryMethod.STANDARD)
    payment = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.CARD)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.CONFIRMED)
    subtotal = models.PositiveIntegerField(default=0)
    delivery_fee = models.PositiveIntegerField(default=0)
    service_fee = models.PositiveIntegerField(default=0)
    total = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.order_number


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name="order_items", null=True, blank=True, on_delete=models.SET_NULL)
    product_external_id = models.CharField(max_length=32)
    product_slug = models.SlugField()
    product_name = models.CharField(max_length=160)
    unit_price = models.PositiveIntegerField()
    quantity = models.PositiveIntegerField()
    notes = models.TextField(blank=True)
    line_total = models.PositiveIntegerField()

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:
        return f"{self.quantity} x {self.product_name}"


class ContactMessage(TimeStampedModel):
    class Topic(models.TextChoices):
        GENERAL = "general", "General enquiry"
        RESERVATION = "reservation", "Reservation"
        EVENTS = "events", "Private events"
        PRESS = "press", "Press & partnerships"
        CAREERS = "careers", "Careers"

    class Status(models.TextChoices):
        NEW = "new", "New"
        IN_PROGRESS = "in_progress", "In progress"
        RESOLVED = "resolved", "Resolved"

    name = models.CharField(max_length=160)
    email = models.EmailField()
    topic = models.CharField(max_length=24, choices=Topic.choices, default=Topic.GENERAL)
    message = models.TextField()
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.NEW)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} - {self.get_topic_display()}"


class WishlistItem(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="wishlist_items", null=True, blank=True, on_delete=models.CASCADE)
    session_key = models.CharField(max_length=80, blank=True)
    product = models.ForeignKey(Product, related_name="wishlist_items", on_delete=models.CASCADE)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "product"],
                condition=models.Q(user__isnull=False),
                name="unique_user_wishlist_product",
            ),
            models.UniqueConstraint(
                fields=["session_key", "product"],
                condition=~models.Q(session_key=""),
                name="unique_session_wishlist_product",
            ),
        ]

    def __str__(self) -> str:
        owner = self.user_id or self.session_key or "guest"
        return f"{owner} - {self.product.name}"
