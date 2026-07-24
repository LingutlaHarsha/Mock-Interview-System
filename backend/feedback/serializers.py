from rest_framework import serializers
from .models import Feedback
from bookings.serializers import BookingSerializer

class FeedbackSerializer(serializers.ModelSerializer):
    booking_details = BookingSerializer(source='booking', read_only=True)

    class Meta:
        model = Feedback
        fields = [
            'id', 'booking', 'booking_details', 'rating', 'technical',
            'communication', 'problem_solving', 'confidence', 'body_language',
            'comments', 'strengths', 'improvements', 'recommendation', 'created_at'
        ]
        read_only_fields = ['created_at']