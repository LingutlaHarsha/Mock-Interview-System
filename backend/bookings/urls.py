from django.urls import path
from .views import (
    BookingListCreateAPIView,
    AvailableSlotsAPIView,
    CancelBookingAPIView,
    ApproveBookingAPIView,
    RejectBookingAPIView
)

urlpatterns = [
    path("available-slots/", AvailableSlotsAPIView.as_view(), name="available-slots"),
    path("book/", BookingListCreateAPIView.as_view(), name="book-interview"),
    path("<int:pk>/cancel/", CancelBookingAPIView.as_view(), name="cancel-booking"),
    path("<int:pk>/approve/", ApproveBookingAPIView.as_view(), name="approve-booking"),
    path("<int:pk>/reject/", RejectBookingAPIView.as_view(), name="reject-booking"),
]