from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Category, Order, Product, Review


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
