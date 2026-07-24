from rest_framework import serializers
from .models import User
from students.models import StudentProfile
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role", "is_approved", "date_joined"]
        read_only_fields = ["id", "role", "is_approved", "date_joined"]

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "role"]

    def create(self, validated_data):
        role = validated_data.get("role", "student")
        is_approved = True if role != "faculty" else False
        
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            role=role,
            is_approved=is_approved
        )

        if role == "student":
            StudentProfile.objects.get_or_create(
                user=user,
                defaults={
                    "full_name": user.username,
                    "roll_number": f"TEMP_{user.id}",
                    "branch": "General",
                    "year": "1",
                    "phone": "",
                    "cgpa": 0.0,
                    "skills": ""
                }
            )

        return user


class LoginSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["role"] = user.role
        token["is_approved"] = user.is_approved
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        requested_role = self.context["request"].data.get("role")

        if requested_role and self.user.role != requested_role:
            raise serializers.ValidationError({
                "detail": "Invalid role for this login."
            })

        if self.user.role == "faculty" and not self.user.is_approved:
            raise serializers.ValidationError({
                "detail": "Your account is awaiting administrator approval."
            })

        data["username"] = self.user.username
        data["role"] = self.user.role
        data["is_approved"] = self.user.is_approved

        return data