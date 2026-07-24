from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from .models import Feedback
from .serializers import FeedbackSerializer
from bookings.models import Booking
from notifications.models import Notification
from accounts.permissions import IsFaculty


class FeedbackListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Feedback.objects.filter(booking__student=user).order_by('-created_at')
        elif user.role == 'faculty':
            return Feedback.objects.filter(booking__interview_slot__faculty=user).order_by('-created_at')
        return Feedback.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'faculty' and user.role != 'admin':
            raise ValidationError({"detail": "Only faculty members can submit feedback."})

        booking = serializer.validated_data['booking']
        
        # Verify faculty ownership of the slot
        if booking.interview_slot.faculty != user and user.role != 'admin':
            raise ValidationError({"detail": "You can only submit feedback for your assigned interview slots."})

        if Feedback.objects.filter(booking=booking).exists():
            raise ValidationError({"detail": "Feedback for this interview booking has already been submitted."})

        # Save feedback
        feedback = serializer.save()

        # Update booking status to Completed
        booking.status = 'Completed'
        booking.save()

        # Update slot status if all completed
        slot = booking.interview_slot
        if not Booking.objects.filter(interview_slot=slot, status='Booked').exists():
            slot.status = 'Completed'
            slot.save()

        # Notify student
        Notification.objects.create(
            user=booking.student,
            title="Interview Feedback Received",
            message=f'Faculty has submitted evaluation feedback for your interview "{slot.title}". Recommendation: {feedback.recommendation}.'
        )


class FeedbackDetailAPIView(generics.RetrieveAPIView):
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Feedback.objects.filter(booking__student=user)
        elif user.role == 'faculty':
            return Feedback.objects.filter(booking__interview_slot__faculty=user)
        return Feedback.objects.all()