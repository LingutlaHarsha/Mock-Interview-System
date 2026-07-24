from django.db import models
from bookings.models import Booking

class Feedback(models.Model):
    RECOMMENDATION_CHOICES = [
        ('Ready', 'Ready'),
        ('Needs Practice', 'Needs Practice'),
        ('Not Ready', 'Not Ready'),
    ]

    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE
    )
    rating = models.IntegerField(default=3)
    technical = models.IntegerField(default=3)
    communication = models.IntegerField(default=3)
    problem_solving = models.IntegerField(default=3)
    confidence = models.IntegerField(default=3)
    body_language = models.IntegerField(default=3)

    comments = models.TextField()
    strengths = models.TextField(blank=True)
    improvements = models.TextField(blank=True)
    recommendation = models.CharField(
        max_length=30,
        choices=RECOMMENDATION_CHOICES,
        default='Needs Practice'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback for Booking #{self.booking.id}"