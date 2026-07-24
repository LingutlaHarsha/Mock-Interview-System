from django.urls import path
from .views import (
    StudentDashboardAPIView,
    FacultyDashboardAPIView,
    AdminDashboardAPIView
)

urlpatterns = [
    path("student/", StudentDashboardAPIView.as_view(), name="student-dashboard"),
    path("faculty/", FacultyDashboardAPIView.as_view(), name="faculty-dashboard"),
    path("admin/", AdminDashboardAPIView.as_view(), name="admin-dashboard"),
]