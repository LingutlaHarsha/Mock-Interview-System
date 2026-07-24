from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from datetime import date

from .models import InterviewSlot
from .serializers import InterviewSlotSerializer
from accounts.permissions import IsFaculty
from bookings.models import Booking
from bookings.serializers import BookingSerializer
from feedback.models import Feedback


class InterviewSlotListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = InterviewSlotSerializer
    permission_classes = [IsFaculty]

    def get_queryset(self):
        return InterviewSlot.objects.filter(faculty=self.request.user).order_by('-interview_date', '-interview_time')

    def perform_create(self, serializer):
        max_s = serializer.validated_data.get('max_students', 1)
        serializer.save(faculty=self.request.user, remaining_seats=max_s)


class InterviewSlotDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = InterviewSlotSerializer
    permission_classes = [IsFaculty]

    def get_queryset(self):
        return InterviewSlot.objects.filter(faculty=self.request.user)

    def perform_destroy(self, instance):
        if Booking.objects.filter(interview_slot=instance, status='Booked').exists():
            raise ValidationError({"detail": "Cannot delete slot with active bookings. Cancel the slot instead."})
        instance.delete()


class FacultyTodayInterviewsAPIView(APIView):
    permission_classes = [IsFaculty]

    def get(self, request):
        today = date.today()
        slots = InterviewSlot.objects.filter(
            faculty=request.user,
            interview_date=today
        ).order_by('interview_time')
        
        result = []
        for s in slots:
            bookings = Booking.objects.filter(interview_slot=s, status__in=['Booked', 'Completed'])
            if bookings.exists():
                for b in bookings:
                    profile = getattr(b.student, 'studentprofile', None)
                    student_name = profile.full_name if (profile and profile.full_name) else b.student.username
                    has_fb = Feedback.objects.filter(booking=b).exists()
                    result.append({
                        "id": b.id,
                        "slot_id": s.id,
                        "student_name": student_name,
                        "student_email": b.student.email,
                        "interview_slot_details": InterviewSlotSerializer(s).data,
                        "status": b.status,
                        "is_booked": True,
                        "has_feedback": has_fb
                    })
            else:
                result.append({
                    "id": f"slot-{s.id}",
                    "slot_id": s.id,
                    "student_name": "Awaiting Student Booking",
                    "student_email": "N/A",
                    "interview_slot_details": InterviewSlotSerializer(s).data,
                    "status": s.status,
                    "is_booked": False
                })
                
        return Response(result)


class FacultyBookedStudentsAPIView(APIView):
    permission_classes = [IsFaculty]

    def get(self, request):
        bookings = Booking.objects.filter(
            interview_slot__faculty=request.user
        ).order_by('-booked_at')
        
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)