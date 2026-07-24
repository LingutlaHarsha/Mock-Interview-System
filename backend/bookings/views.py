from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from datetime import date

from .models import Booking
from .serializers import BookingSerializer
from faculty.models import InterviewSlot
from faculty.serializers import InterviewSlotSerializer
from students.models import StudentProfile
from notifications.models import Notification
from accounts.permissions import IsStudent


class AvailableSlotsAPIView(generics.ListAPIView):
    serializer_class = InterviewSlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        today = date.today()
        queryset = InterviewSlot.objects.filter(
            interview_date__gte=today,
            remaining_seats__gt=0,
            status='Available'
        ).order_by('interview_date', 'interview_time')

        search = self.request.query_params.get('search', None)
        date_filter = self.request.query_params.get('date', None)

        if search:
            queryset = queryset.filter(title__icontains=search) | queryset.filter(faculty__username__icontains=search)
        if date_filter:
            queryset = queryset.filter(interview_date=date_filter)

        return queryset


class BookingListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Booking.objects.filter(student=user).order_by('-booked_at')
        elif user.role == 'faculty':
            return Booking.objects.filter(interview_slot__faculty=user).order_by('-booked_at')
        return Booking.objects.all().order_by('-booked_at')

    def perform_create(self, serializer):
        user = self.request.user

        # Profile and resume prerequisites check
        try:
            profile = StudentProfile.objects.get(user=user)
            has_resume = bool(profile.resume and hasattr(profile.resume, 'name') and profile.resume.name)
            if not has_resume:
                raise ValidationError({"detail": "You must upload your PDF resume before applying for an interview slot."})
            if not profile.full_name or not profile.branch or not profile.phone or not profile.roll_number or profile.roll_number.startswith('TEMP_'):
                raise ValidationError({"detail": "Please complete your student profile details (Full Name, Roll Number, Branch, Phone) before applying for an interview slot."})
        except StudentProfile.DoesNotExist:
            raise ValidationError({"detail": "Student profile not found. Please complete your profile details first."})

        interview_slot = serializer.validated_data["interview_slot"]

        # Date validation
        if interview_slot.interview_date < date.today():
            raise ValidationError({"detail": "Cannot book an interview slot in the past."})

        # Seat capacity check
        if interview_slot.remaining_seats <= 0 or interview_slot.status == 'Cancelled':
            raise ValidationError({"detail": "This interview slot is fully booked or no longer available."})

        # Check total active requests + booked count against max_students capacity
        active_requests_count = Booking.objects.filter(
            interview_slot=interview_slot,
            status__in=['Pending', 'Booked']
        ).count()

        if active_requests_count >= interview_slot.max_students:
            raise ValidationError({"detail": "Maximum student request capacity reached for this interview slot."})

        # Duplicate active booking check
        if Booking.objects.filter(
            student=user,
            interview_slot=interview_slot,
            status__in=['Pending', 'Booked']
        ).exists():
            raise ValidationError({"detail": "You have already requested or booked this interview slot."})

        # Save booking with Pending status (seat remaining_seats is decremented when Faculty ACCEPTS)
        booking = serializer.save(student=user, status='Pending')

        # Create notifications for student and faculty
        Notification.objects.create(
            user=user,
            title="Interview Request Submitted",
            message=f'Your interview request for "{booking.interview_slot.title}" on {booking.interview_slot.interview_date} has been submitted and is pending faculty approval.'
        )

        Notification.objects.create(
            user=interview_slot.faculty,
            title="New Student Booking Request",
            message=f'Student {user.username} requested to attend your slot "{booking.interview_slot.title}". Please review student details to accept or decline.'
        )


class ApproveBookingAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk, interview_slot__faculty=request.user)
            if booking.status in ['Completed', 'Cancelled', 'Rejected']:
                raise ValidationError({"detail": f"Cannot approve a booking that is {booking.status}."})

            if booking.status == 'Booked':
                return Response({"message": "Student interview booking is already approved!", "status": booking.status}, status=status.HTTP_200_OK)

            # Change status to Booked
            booking.status = 'Booked'
            booking.save()

            # Decrement remaining seats when faculty accepts
            slot = booking.interview_slot
            if slot.remaining_seats > 0:
                slot.remaining_seats -= 1
            if slot.remaining_seats <= 0:
                slot.status = 'Booked'
            slot.save()

            Notification.objects.create(
                user=booking.student,
                title="Interview Request Approved!",
                message=f'Faculty {request.user.username} has APPROVED your interview request for "{slot.title}" on {slot.interview_date}. Venue/Link: {slot.venue_or_link}.'
            )
            return Response({"message": "Student interview booking approved successfully!", "status": booking.status}, status=status.HTTP_200_OK)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking request not found or unauthorized."}, status=status.HTTP_404_NOT_FOUND)


class RejectBookingAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk, interview_slot__faculty=request.user)
            if booking.status in ['Completed', 'Cancelled', 'Rejected']:
                raise ValidationError({"detail": f"Booking request is already {booking.status}."})

            old_status = booking.status
            booking.status = 'Rejected'
            booking.save()

            # If booking was already accepted ('Booked'), restore remaining seat capacity
            slot = booking.interview_slot
            if old_status == 'Booked':
                slot.remaining_seats += 1
                if slot.status == 'Booked':
                    slot.status = 'Available'
                slot.save()

            Notification.objects.create(
                user=booking.student,
                title="Interview Request Declined",
                message=f'Faculty {request.user.username} declined your interview request for "{slot.title}".'
            )
            return Response({"message": "Interview request declined.", "status": booking.status}, status=status.HTTP_200_OK)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking request not found."}, status=status.HTTP_404_NOT_FOUND)


class CancelBookingAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        if booking.student != request.user and booking.interview_slot.faculty != request.user and request.user.role != 'admin':
            return Response({"detail": "Unauthorized to cancel this booking."}, status=status.HTTP_403_FORBIDDEN)

        if booking.status == 'Cancelled':
            return Response({"detail": "Booking is already cancelled."}, status=status.HTTP_400_BAD_REQUEST)

        old_status = booking.status
        booking.status = 'Cancelled'
        booking.save()

        # If booking was accepted ('Booked'), restore remaining seat capacity
        slot = booking.interview_slot
        if old_status == 'Booked':
            slot.remaining_seats += 1
            if slot.status == 'Booked':
                slot.status = 'Available'
            slot.save()

        # Notify student & faculty
        Notification.objects.create(
            user=booking.student,
            title="Interview Cancelled",
            message=f'Your interview booking for "{slot.title}" has been cancelled.'
        )
        Notification.objects.create(
            user=slot.faculty,
            title="Booking Cancelled",
            message=f'Booking for "{slot.title}" by {booking.student.username} was cancelled.'
        )

        return Response({"message": "Booking cancelled successfully."}, status=status.HTTP_200_OK)