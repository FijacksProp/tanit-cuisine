from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase
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
