from django.urls import path
from .views import FeedbackListCreateAPIView, FeedbackDetailAPIView

urlpatterns = [
    path("", FeedbackListCreateAPIView.as_view(), name="feedback-list-create"),
    path("submit/", FeedbackListCreateAPIView.as_view(), name="submit-feedback"),
    path("<int:pk>/", FeedbackDetailAPIView.as_view(), name="feedback-detail"),
]