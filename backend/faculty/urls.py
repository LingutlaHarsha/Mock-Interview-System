from django.urls import path
from .views import (
    InterviewSlotListCreateAPIView,
    InterviewSlotDetailAPIView,
    FacultyTodayInterviewsAPIView,
    FacultyBookedStudentsAPIView
)

urlpatterns = [
    path("slots/", InterviewSlotListCreateAPIView.as_view(), name="faculty-slots"),
    path("slots/<int:pk>/", InterviewSlotDetailAPIView.as_view(), name="faculty-slot-detail"),
    path("today-interviews/", FacultyTodayInterviewsAPIView.as_view(), name="faculty-today-interviews"),
    path("booked-students/", FacultyBookedStudentsAPIView.as_view(), name="faculty-booked-students"),
]