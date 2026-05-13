from django.urls import path

from .views import ProfileView, SigninView, SignoutView, SignupStartView, SignupVerifyView, TokenRefresh

urlpatterns = [
    path("signup/start/", SignupStartView.as_view(), name="signup-start"),
    path("signup/verify/", SignupVerifyView.as_view(), name="signup-verify"),
    path("signin/", SigninView.as_view(), name="signin"),
    path("signout/", SignoutView.as_view(), name="signout"),
    path("token/refresh/", TokenRefresh.as_view(), name="token-refresh"),
    path("me/", ProfileView.as_view(), name="profile"),
]
