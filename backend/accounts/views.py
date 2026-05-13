from django.conf import settings
from django.core.mail import send_mail
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView

from .serializers import SigninSerializer, SignupStartSerializer, SignupVerifySerializer, UserSerializer


class SignupStartView(generics.CreateAPIView):
    authentication_classes = []
    permission_classes = []
    serializer_class = SignupStartSerializer


class SignupVerifyView(generics.CreateAPIView):
    authentication_classes = []
    permission_classes = []
    serializer_class = SignupVerifySerializer


class SigninView(generics.CreateAPIView):
    authentication_classes = []
    permission_classes = []
    serializer_class = SigninSerializer


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class SignoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({"detail": "Signed out. Discard tokens on the client."})


class EmailDiagnosticsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        recipient = request.data.get("email") or request.user.email
        send_mail(
            subject="Tanit Cuisine email test",
            message="Your Tanit Cuisine email settings are working.",
            from_email=None,
            recipient_list=[recipient],
            fail_silently=False,
        )
        return Response(
            {
                "detail": f"Test email sent to {recipient}.",
                "backend": settings.EMAIL_BACKEND,
                "host": settings.EMAIL_HOST,
                "port": settings.EMAIL_PORT,
                "useTls": settings.EMAIL_USE_TLS,
                "useSsl": settings.EMAIL_USE_SSL,
                "fromEmail": settings.DEFAULT_FROM_EMAIL,
            }
        )


TokenRefresh = TokenRefreshView
