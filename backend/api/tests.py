from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Category, Order, Product, Review

User = get_user_model()


class ApiMappingTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_catalog", verbosity=0)

    def setUp(self):
        self.client = APIClient()

    def test_catalog_seed_counts(self):
        self.assertEqual(Category.objects.count(), 8)
        self.assertEqual(Product.objects.count(), 20)
        self.assertEqual(Review.objects.count(), 44)

    def test_products_list_uses_frontend_contract(self):
        response = self.client.get("/api/products/?category=signature-rice&q=jollof")
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 1)
        first = response.data[0]
        self.assertIn("shortDescription", first)
        self.assertIn("spiceLevel", first)
        self.assertIn("reviewCount", first)

    def test_product_detail_includes_reviews_and_pairings(self):
        response = self.client.get("/api/products/royal-jollof-rice/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["slug"], "royal-jollof-rice")
        self.assertGreaterEqual(len(response.data["reviews"]), 1)
        self.assertIn("chapman-reserve", response.data["pairings"])

    def test_order_create_calculates_totals_and_snapshots_items(self):
        response = self.client.post(
            "/api/orders/",
            {
                "fullName": "Test Guest",
                "email": "guest@example.com",
                "phone": "+2348012345678",
                "address": "GRA, Ilorin",
                "city": "Ilorin",
                "state": "Kwara",
                "delivery": "standard",
                "payment": "cash",
                "items": [{"productId": "p-001", "quantity": 2}],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(response.data["subtotal"], 31000)
        self.assertEqual(response.data["deliveryFee"], 0)
        self.assertEqual(response.data["serviceFee"], 775)
        self.assertEqual(response.data["total"], 31775)
        self.assertEqual(response.data["items"][0]["productName"], "Royal Jollof Rice")

    def test_authenticated_order_is_attached_to_user(self):
        user = User.objects.create_user(
            email="guest@example.com",
            full_name="Test Guest",
            password="strong-password",
            is_email_verified=True,
        )
        self.client.force_authenticate(user=user)
        response = self.client.post(
            "/api/orders/",
            {
                "fullName": "Test Guest",
                "email": "guest@example.com",
                "phone": "+2348012345678",
                "address": "GRA, Ilorin",
                "city": "Ilorin",
                "state": "Kwara",
                "delivery": "standard",
                "payment": "cash",
                "items": [{"productId": "p-001", "quantity": 1}],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Order.objects.get().user, user)

    def test_authenticated_user_can_review_meal_and_verified_if_ordered(self):
        user = User.objects.create_user(
            email="guest@example.com",
            full_name="Test Guest",
            password="strong-password",
            is_email_verified=True,
        )
        self.client.force_authenticate(user=user)
        self.client.post(
            "/api/orders/",
            {
                "fullName": "Test Guest",
                "email": "guest@example.com",
                "phone": "+2348012345678",
                "address": "GRA, Ilorin",
                "city": "Ilorin",
                "state": "Kwara",
                "delivery": "standard",
                "payment": "cash",
                "items": [{"productId": "p-001", "quantity": 1}],
            },
            format="json",
        )
        response = self.client.post(
            "/api/products/royal-jollof-rice/reviews/",
            {
                "rating": 5,
                "title": "Excellent meal",
                "comment": "The jollof was smoky, hot, and beautifully packed.",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["review"]["verified"])
        self.assertEqual(response.data["productReviewCount"], Product.objects.get(slug="royal-jollof-rice").review_count)

    def test_user_can_only_review_product_once(self):
        user = User.objects.create_user(
            email="guest@example.com",
            full_name="Test Guest",
            password="strong-password",
            is_email_verified=True,
        )
        self.client.force_authenticate(user=user)
        payload = {
            "rating": 4,
            "title": "Lovely",
            "comment": "A very lovely meal with balanced spice.",
        }
        first = self.client.post("/api/products/royal-jollof-rice/reviews/", payload, format="json")
        second = self.client.post("/api/products/royal-jollof-rice/reviews/", payload, format="json")
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 400)

    def test_admin_summary_requires_staff_user(self):
        normal_user = User.objects.create_user(
            email="guest@example.com",
            full_name="Test Guest",
            password="strong-password",
            is_email_verified=True,
        )
        self.client.force_authenticate(user=normal_user)
        forbidden = self.client.get("/api/admin/summary/")
        self.assertEqual(forbidden.status_code, 403)

        staff_user = User.objects.create_user(
            email="staff@example.com",
            full_name="Staff User",
            password="strong-password",
            is_staff=True,
            is_email_verified=True,
        )
        self.client.force_authenticate(user=staff_user)
        response = self.client.get("/api/admin/summary/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("orders", response.data["counts"])
        self.assertIn("recentOrders", response.data)

    def test_staff_can_update_product_availability_only(self):
        staff_user = User.objects.create_user(
            email="staff@example.com",
            full_name="Staff User",
            password="strong-password",
            is_staff=True,
            is_email_verified=True,
        )
        product = Product.objects.get(external_id="p-001")
        self.client.force_authenticate(user=staff_user)

        allowed = self.client.patch(
            f"/api/admin/products/{product.id}/",
            {"isAvailable": False},
            format="json",
        )
        self.assertEqual(allowed.status_code, 200)
        product.refresh_from_db()
        self.assertFalse(product.is_available)

        forbidden = self.client.patch(
            f"/api/admin/products/{product.id}/",
            {"price": 1},
            format="json",
        )
        self.assertEqual(forbidden.status_code, 403)
