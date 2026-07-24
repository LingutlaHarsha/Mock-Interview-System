from rest_framework import serializers
from .models import Booking
from faculty.serializers import InterviewSlotSerializer
from students.serializers import StudentProfileSerializer
from feedback.models import Feedback

class BookingSerializer(serializers.ModelSerializer):
    interview_slot_details = InterviewSlotSerializer(source='interview_slot', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    student_name = serializers.SerializerMethodField()
    student_resume = serializers.SerializerMethodField()
    student_profile = serializers.SerializerMethodField()
    has_feedback = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'student', 'student_email', 'student_name', 'student_resume', 'student_profile',
            'interview_slot', 'interview_slot_details',
            'booked_at', 'status', 'has_feedback'
        ]
        read_only_fields = ['student', 'booked_at']

    def get_student_name(self, obj):
        try:
            return obj.student.studentprofile.full_name
        except Exception:
            return obj.student.username

    def get_student_resume(self, obj):
        try:
            if obj.student.studentprofile.resume:
                return obj.student.studentprofile.resume.url
        except Exception:
            pass
        return None

    def get_student_profile(self, obj):
        try:
            if hasattr(obj.student, 'studentprofile'):
                return StudentProfileSerializer(obj.student.studentprofile).data
        except Exception:
            pass
        return None

    def get_has_feedback(self, obj):
        return Feedback.objects.filter(booking=obj).exists()