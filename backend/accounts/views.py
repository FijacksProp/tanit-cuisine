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


TokenRefresh = TokenRefreshView
