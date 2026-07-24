from rest_framework import serializers
from .models import InterviewSlot

class InterviewSlotSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source='faculty.username', read_only=True)
    faculty_email = serializers.CharField(source='faculty.email', read_only=True)
    end_time = serializers.TimeField(required=False, allow_null=True, default=None)

    class Meta:
        model = InterviewSlot
        fields = [
            'id', 'faculty', 'faculty_name', 'faculty_email', 'title',
            'interview_date', 'interview_time', 'end_time', 'duration_minutes',
            'mode', 'venue_or_link', 'max_students', 'remaining_seats', 'status'
        ]
        read_only_fields = ['faculty', 'remaining_seats']

    def create(self, validated_data):
        if 'remaining_seats' not in validated_data:
            validated_data['remaining_seats'] = validated_data.get('max_students', 1)
        return super().create(validated_data)