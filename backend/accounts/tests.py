from django.contrib.auth import get_user_model
from django.core import mail
from django.core.management import call_command
from django.test import TestCase
from django.test.utils import override_settings
from unittest.mock import patch
from rest_framework.test import APIClient

from .models import EmailOTP

User = get_user_model()


class AccountAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_signup_start_sends_otp_email(self):
        response = self.client.post(
            "/api/auth/signup/start/",
            {
                "email": "guest@example.com",
                "fullName": "Test Guest",
                "phone": "+2348012345678",
                "password": "strong-password",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(EmailOTP.objects.count(), 1)
        self.assertEqual(len(mail.outbox), 1)

    @patch("accounts.serializers.send_mail", side_effect=RuntimeError("smtp misconfigured"))
    def test_signup_start_returns_json_when_email_fails(self, _send_mail):
        response = self.client.post(
            "/api/auth/signup/start/",
            {
                "email": "guest@example.com",
                "fullName": "Test Guest",
                "phone": "+2348012345678",
                "password": "strong-password",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)

    def test_signup_verify_creates_user_and_tokens(self):
        self.client.post(
            "/api/auth/signup/start/",
            {
                "email": "guest@example.com",
                "fullName": "Test Guest",
                "phone": "+2348012345678",
                "password": "strong-password",
            },
            format="json",
        )
        code = mail.outbox[0].body.split(" is ")[1].split(".")[0]
        response = self.client.post(
            "/api/auth/signup/verify/",
            {"email": "guest@example.com", "code": code},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(User.objects.count(), 1)
        self.assertIn("access", response.data["tokens"])
        self.assertTrue(User.objects.get().is_email_verified)

    def test_signin_and_profile(self):
        User.objects.create_user(
            email="guest@example.com",
            full_name="Test Guest",
            password="strong-password",
            is_email_verified=True,
        )
        response = self.client.post(
            "/api/auth/signin/",
            {"email": "guest@example.com", "password": "strong-password"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        access = response.data["tokens"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        profile = self.client.get("/api/auth/me/")
        self.assertEqual(profile.status_code, 200)
        self.assertEqual(profile.data["email"], "guest@example.com")

    @patch.dict("os.environ", {}, clear=True)
    def test_ensure_superuser_skips_without_env(self):
        call_command("ensure_superuser", verbosity=0)
        self.assertEqual(User.objects.count(), 0)

    @patch.dict(
        "os.environ",
        {
            "DJANGO_SUPERUSER_EMAIL": "admin@example.com",
            "DJANGO_SUPERUSER_PASSWORD": "strong-admin-password",
            "DJANGO_SUPERUSER_FULL_NAME": "Tanit Admin",
        },
        clear=True,
    )
    def test_ensure_superuser_creates_admin_from_env(self):
        call_command("ensure_superuser", verbosity=0)
        user = User.objects.get(email="admin@example.com")
        self.assertEqual(user.full_name, "Tanit Admin")
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_email_verified)
        self.assertTrue(user.check_password("strong-admin-password"))

    def test_email_diagnostics_requires_staff(self):
        user = User.objects.create_user(
            email="guest@example.com",
            full_name="Test Guest",
            password="strong-password",
            is_email_verified=True,
        )
        self.client.force_authenticate(user=user)
        response = self.client.post("/api/auth/email-test/", {}, format="json")
        self.assertEqual(response.status_code, 403)

    def test_staff_can_send_email_diagnostics(self):
        user = User.objects.create_user(
            email="staff@example.com",
            full_name="Staff User",
            password="strong-password",
            is_staff=True,
            is_email_verified=True,
        )
        self.client.force_authenticate(user=user)
        response = self.client.post("/api/auth/email-test/", {}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["staff@example.com"])
        self.assertIn("backend", response.data)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.smtp.EmailBackend", EMAIL_HOST="invalid.local")
    def test_email_diagnostics_returns_json_when_email_fails(self):
        user = User.objects.create_user(
            email="staff@example.com",
            full_name="Staff User",
            password="strong-password",
            is_staff=True,
            is_email_verified=True,
        )
        self.client.force_authenticate(user=user)
        with patch("accounts.views.send_mail", side_effect=RuntimeError("smtp misconfigured")):
            response = self.client.post("/api/auth/email-test/", {}, format="json")
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.data["detail"], "Email sending failed.")
        self.assertEqual(response.data["errorType"], "RuntimeError")
        self.assertIn("hostPasswordSet", response.data)
