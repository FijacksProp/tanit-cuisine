import json
import re
from calendar import monthrange
from datetime import datetime
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import Category, Product, Review


def parse_review_date(value: str):
    try:
        return datetime.strptime(value, "%B %d, %Y").date()
    except ValueError:
        match = re.fullmatch(r"([A-Za-z]+) (\d{1,2}), (\d{4})", value)
        if not match:
            raise
        month_name, day_text, year_text = match.groups()
        month = datetime.strptime(month_name, "%B").month
        year = int(year_text)
        day = min(int(day_text), monthrange(year, month)[1])
        return datetime(year, month, day).date()


class Command(BaseCommand):
    help = "Seed categories, products, pairings, and reviews from a catalog JSON export."

    def add_arguments(self, parser):
        default_path = Path(__file__).resolve().parents[2] / "fixtures" / "catalog.json"
        parser.add_argument("--path", default=str(default_path), help="Path to catalog JSON.")

    @transaction.atomic
    def handle(self, *args, **options):
        path = Path(options["path"])
        if not path.exists():
            self.stderr.write(self.style.ERROR(f"Catalog fixture not found: {path}"))
            return

        data = json.loads(path.read_text(encoding="utf-8-sig"))
        categories = data.get("categories", [])
        products = data.get("products", [])

        category_by_slug = {}
        for index, item in enumerate(categories):
            category, _ = Category.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    "name": item["name"],
                    "tagline": item["tagline"],
                    "description": item["description"],
                    "image": item["image"],
                    "sort_order": index,
                    "is_active": True,
                },
            )
            category_by_slug[category.slug] = category

        product_by_slug = {}
        for index, item in enumerate(products):
            product, _ = Product.objects.update_or_create(
                external_id=item["id"],
                defaults={
                    "slug": item["slug"],
                    "name": item["name"],
                    "category": category_by_slug[item["category"]],
                    "price": item["price"],
                    "old_price": item.get("oldPrice"),
                    "short_description": item["shortDescription"],
                    "description": item["description"],
                    "image": item["image"],
                    "ingredients": item.get("ingredients", []),
                    "dietary": item.get("dietary", []),
                    "spice_level": item.get("spiceLevel", 0),
                    "prep_time_minutes": item.get("prepTimeMinutes", 0),
                    "serving_size": item["servingSize"],
                    "calories": item.get("calories", 0),
                    "rating": item.get("rating", 0),
                    "review_count": item.get("reviewCount", 0),
                    "featured": item.get("featured", False),
                    "is_new": item.get("isNew", False),
                    "bestseller": item.get("bestseller", False),
                    "is_available": True,
                    "sort_order": index,
                },
            )
            product_by_slug[product.slug] = product

        for item in products:
            product = product_by_slug[item["slug"]]
            product.pairings.set(
                product_by_slug[slug]
                for slug in item.get("pairings", [])
                if slug in product_by_slug
            )

            for review in item.get("reviews", []):
                Review.objects.update_or_create(
                    external_id=review["id"],
                    defaults={
                        "product": product,
                        "author": review["author"],
                        "initials": review["initials"],
                        "rating": review["rating"],
                        "reviewed_at": parse_review_date(review["date"]),
                        "title": review["title"],
                        "comment": review["comment"],
                        "verified": review.get("verified", True),
                        "is_visible": True,
                    },
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(categories)} categories, {len(products)} products, "
                f"and {sum(len(product.get('reviews', [])) for product in products)} reviews."
            )
        )
