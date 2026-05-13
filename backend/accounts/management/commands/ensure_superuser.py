import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Create or update a superuser from environment variables."

    def handle(self, *args, **options):
        email = os.getenv("DJANGO_SUPERUSER_EMAIL", "").strip()
        password = os.getenv("DJANGO_SUPERUSER_PASSWORD", "")
        full_name = os.getenv("DJANGO_SUPERUSER_FULL_NAME", "Tanit Admin").strip() or "Tanit Admin"

        if not email and not password:
            self.stdout.write(self.style.WARNING("Skipping superuser bootstrap; env vars are not set."))
            return
        if not email or not password:
            raise CommandError("Set both DJANGO_SUPERUSER_EMAIL and DJANGO_SUPERUSER_PASSWORD.")

        User = get_user_model()
        user, created = User.objects.get_or_create(
            email=User.objects.normalize_email(email),
            defaults={
                "full_name": full_name,
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
                "is_email_verified": True,
            },
        )

        changed_fields = []
        for field, value in {
            "full_name": full_name,
            "is_staff": True,
            "is_superuser": True,
            "is_active": True,
            "is_email_verified": True,
        }.items():
            if getattr(user, field) != value:
                setattr(user, field, value)
                changed_fields.append(field)

        if created or not user.has_usable_password() or os.getenv("DJANGO_SUPERUSER_UPDATE_PASSWORD", "false").lower() == "true":
            user.set_password(password)
            changed_fields.append("password")

        if changed_fields:
            user.save()

        action = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"{action} superuser {user.email}."))
