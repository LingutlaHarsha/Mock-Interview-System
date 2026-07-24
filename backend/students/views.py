from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser

from accounts.permissions import IsStudent
from .models import StudentProfile
from .serializers import StudentProfileSerializer, ResumeUploadSerializer


class StudentProfileAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [IsStudent]

    def get_object(self):
        return StudentProfile.objects.get(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save()


class ResumeUploadAPIView(generics.UpdateAPIView):
    serializer_class = ResumeUploadSerializer
    permission_classes = [IsStudent]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return StudentProfile.objects.get(user=self.request.user)