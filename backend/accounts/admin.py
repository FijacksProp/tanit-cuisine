from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import EmailOTP, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    model = User
    list_display = ("email", "full_name", "phone", "is_email_verified", "is_staff", "is_active", "date_joined")
    list_filter = ("is_email_verified", "is_staff", "is_active", "date_joined")
    search_fields = ("email", "full_name", "phone")
    ordering = ("email",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("full_name", "phone", "default_address", "city", "state", "zip")}),
        ("Permissions", {"fields": ("is_active", "is_email_verified", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "full_name", "phone", "password1", "password2", "is_staff", "is_active"),
            },
        ),
    )


@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ("email", "purpose", "attempts", "expires_at", "consumed_at", "created_at")
    list_filter = ("purpose", "created_at", "consumed_at")
    search_fields = ("email",)
    readonly_fields = ("code_hash", "password_hash", "created_at")
