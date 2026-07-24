from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg
from django.utils import timezone
from datetime import date

from accounts.models import User
from students.models import StudentProfile
from faculty.models import InterviewSlot
from bookings.models import Booking
from feedback.models import Feedback
from notifications.models import Notification
from accounts.permissions import IsFaculty, IsAdmin


class StudentDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = getattr(request.user, 'studentprofile', None)
        if not profile:
            profile, _ = StudentProfile.objects.get_or_create(
                user=request.user,
                defaults={
                    "full_name": request.user.username,
                    "roll_number": f"TEMP_{request.user.id}",
                    "branch": "General",
                    "year": "1",
                    "phone": "",
                    "cgpa": 0.0,
                    "skills": ""
                }
            )

        bookings_count = Booking.objects.filter(student=request.user).count()
        feedbacks_count = Feedback.objects.filter(booking__student=request.user).count()
        unread_notifications = Notification.objects.filter(user=request.user, is_read=False).count()

        # Nearest upcoming accepted interview
        today = date.today()
        now_time = timezone.localtime().time()
        
        upcoming_bookings = Booking.objects.filter(
            student=request.user,
            status='Booked',
            interview_slot__interview_date__gte=today
        ).order_by('interview_slot__interview_date', 'interview_slot__interview_time')

        valid_upcoming = None
        for b in upcoming_bookings:
            if b.interview_slot.interview_date > today:
                valid_upcoming = b
                break
            elif b.interview_slot.interview_date == today and b.interview_slot.interview_time >= now_time:
                valid_upcoming = b
                break

        upcoming_data = None
        if valid_upcoming:
            upcoming_data = {
                "id": valid_upcoming.id,
                "title": valid_upcoming.interview_slot.title,
                "faculty": valid_upcoming.interview_slot.faculty.username,
                "date": valid_upcoming.interview_slot.interview_date,
                "time": valid_upcoming.interview_slot.interview_time,
                "mode": valid_upcoming.interview_slot.mode,
                "venue_or_link": valid_upcoming.interview_slot.venue_or_link
            }

        has_resume = bool(profile.resume and hasattr(profile.resume, 'name') and profile.resume.name)
        resume_url = profile.resume.url if has_resume else None
        
        # Check if profile setup is 100% complete
        is_temp_roll = profile.roll_number and profile.roll_number.startswith('TEMP_')
        profile_complete = bool(profile.full_name and profile.branch and profile.phone and profile.roll_number and not is_temp_roll and has_resume)

        data = {
            "student_name": profile.full_name or request.user.username,
            "branch": profile.branch,
            "year": profile.year,
            "cgpa": profile.cgpa,
            "resume": resume_url,
            "profile_complete": profile_complete,
            "bookings": bookings_count,
            "feedbacks": feedbacks_count,
            "notifications": unread_notifications,
            "upcoming_interview": upcoming_data,
        }

        return Response(data)


class FacultyDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated, IsFaculty]

    def get(self, request):
        today = date.today()
        
        # 1. Total Interviews Conducted (Completed/Evaluated interviews)
        total_conducted = Booking.objects.filter(
            interview_slot__faculty=request.user,
            status='Completed'
        ).count()
        
        # 2. Today's Interviews Count (Accepted & Scheduled for today)
        today_interviews_count = Booking.objects.filter(
            interview_slot__faculty=request.user,
            interview_slot__interview_date=today,
            status__in=['Booked', 'Completed']
        ).count()

        # 3. Completed Interviews Count
        completed_count = Booking.objects.filter(
            interview_slot__faculty=request.user,
            status='Completed'
        ).count()

        # 4. Pending Feedback Count (Booked interviews that need evaluation)
        pending_feedback_count = Booking.objects.filter(
            interview_slot__faculty=request.user,
            status='Booked'
        ).exclude(feedback__isnull=False).count()

        unread_notifications = Notification.objects.filter(user=request.user, is_read=False).count()

        data = {
            "total_conducted": total_conducted,
            "total_slots": total_conducted,
            "today_interviews": today_interviews_count,
            "completed_interviews": completed_count,
            "pending_feedback": pending_feedback_count,
            "notifications": unread_notifications,
        }

        return Response(data)


class AdminDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        today = date.today()
        total_students = User.objects.filter(role='student').count()
        total_faculty = User.objects.filter(role='faculty').count()
        pending_faculty = User.objects.filter(role='faculty', is_approved=False).count()

        today_interviews = Booking.objects.filter(interview_slot__interview_date=today).count()
        completed_interviews = Booking.objects.filter(status='Completed').count()

        avg_rating_query = Feedback.objects.aggregate(Avg('rating'))
        avg_rating = round(avg_rating_query['rating__avg'] or 0.0, 1)

        students_with_resume = StudentProfile.objects.exclude(resume='').exclude(resume__isnull=True).count()
        resume_pct = round((students_with_resume / total_students * 100), 1) if total_students > 0 else 0.0

        data = {
            "total_students": total_students,
            "total_faculty": total_faculty,
            "pending_faculty_approvals": pending_faculty,
            "today_interviews": today_interviews,
            "completed_interviews": completed_interviews,
            "average_rating": avg_rating,
            "resume_uploaded_pct": resume_pct,
        }

        return Response(data)