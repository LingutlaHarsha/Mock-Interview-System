from rest_framework import serializers
from .models import StudentProfile


class StudentProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    cgpa = serializers.DecimalField(max_digits=4, decimal_places=2, required=False, allow_null=True, default=0.00)
    skills = serializers.CharField(required=False, allow_blank=True, default='')
    phone = serializers.CharField(required=False, allow_blank=True, default='')
    branch = serializers.CharField(required=False, allow_blank=True, default='General')

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "email",
            "full_name",
            "roll_number",
            "branch",
            "year",
            "phone",
            "cgpa",
            "skills",
            "resume",
        ]
        read_only_fields = ["id", "email"]

    def validate_cgpa(self, value):
        if value is None or value == '':
            return 0.00
        return value


class ResumeUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ["resume"]