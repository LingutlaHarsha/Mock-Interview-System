from django.urls import path
from .views import StudentProfileAPIView, ResumeUploadAPIView

urlpatterns = [
    path('profile/', StudentProfileAPIView.as_view(), name='student-profile'),
    path("upload-resume/", ResumeUploadAPIView.as_view(), name="upload-resume"),
]