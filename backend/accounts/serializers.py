from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import EmailOTP

User = get_user_model()


def token_payload(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class UserSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source="full_name")
    defaultAddress = serializers.CharField(source="default_address", required=False, allow_blank=True)
    isEmailVerified = serializers.BooleanField(source="is_email_verified", read_only=True)
    isStaff = serializers.BooleanField(source="is_staff", read_only=True)
    isSuperuser = serializers.BooleanField(source="is_superuser", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "fullName",
            "phone",
            "defaultAddress",
            "city",
            "state",
            "zip",
            "isEmailVerified",
            "isStaff",
            "isSuperuser",
            "date_joined",
        ]
        read_only_fields = ["id", "email", "isEmailVerified", "isStaff", "isSuperuser", "date_joined"]


class SignupStartSerializer(serializers.Serializer):
    email = serializers.EmailField()
    fullName = serializers.CharField(max_length=160)
    phone = serializers.CharField(max_length=40, required=False, allow_blank=True)
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_email(self, value):
        email = User.objects.normalize_email(value)
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return email

    def create(self, validated_data):
        code = EmailOTP.generate_code()
        EmailOTP.objects.filter(
            email=validated_data["email"],
            purpose=EmailOTP.Purpose.SIGNUP,
            consumed_at__isnull=True,
        ).update(consumed_at=timezone.now())
        otp = EmailOTP.objects.create(
            email=validated_data["email"],
            purpose=EmailOTP.Purpose.SIGNUP,
            code_hash=EmailOTP.hash_code(code),
            full_name=validated_data["fullName"],
            phone=validated_data.get("phone", ""),
            password_hash=make_password(validated_data["password"]),
            expires_at=EmailOTP.expiry(),
        )
        send_mail(
            subject="Your Tanit Cuisine verification code",
            message=f"Your Tanit Cuisine signup code is {code}. It expires in 10 minutes.",
            from_email=None,
            recipient_list=[otp.email],
            fail_silently=False,
        )
        return otp

    def to_representation(self, instance):
        return {
            "email": instance.email,
            "expiresAt": instance.expires_at,
            "message": "Verification code sent.",
        }


class SignupVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(min_length=6, max_length=6)

    def validate_email(self, value):
        return User.objects.normalize_email(value)

    def validate(self, attrs):
        try:
            otp = EmailOTP.objects.filter(
                email=attrs["email"],
                purpose=EmailOTP.Purpose.SIGNUP,
                consumed_at__isnull=True,
            ).latest("created_at")
        except EmailOTP.DoesNotExist as exc:
            raise serializers.ValidationError({"email": "No active verification code found."}) from exc

        if otp.is_expired:
            raise serializers.ValidationError({"code": "This verification code has expired."})
        if otp.attempts >= otp.max_attempts:
            raise serializers.ValidationError({"code": "Too many attempts. Request a new code."})

        attrs["otp"] = otp
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        otp = validated_data["otp"]
        otp.attempts += 1
        if not otp.check_code(validated_data["code"]):
            otp.save(update_fields=["attempts"])
            raise serializers.ValidationError({"code": "Invalid verification code."})

        if User.objects.filter(email=otp.email).exists():
            raise serializers.ValidationError({"email": "An account with this email already exists."})

        user = User.objects.create(
            email=otp.email,
            full_name=otp.full_name,
            phone=otp.phone,
            password=otp.password_hash,
            is_email_verified=True,
        )
        otp.consumed_at = timezone.now()
        otp.save(update_fields=["attempts", "consumed_at"])
        return user

    def to_representation(self, instance):
        return {
            "user": UserSerializer(instance).data,
            "tokens": token_payload(instance),
        }


class SigninSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = User.objects.normalize_email(attrs["email"])
        user = authenticate(email=email, password=attrs["password"])
        if user is None:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account is disabled.")
        attrs["user"] = user
        return attrs

    def create(self, validated_data):
        return validated_data["user"]

    def to_representation(self, instance):
        return {
            "user": UserSerializer(instance).data,
            "tokens": token_payload(instance),
        }
