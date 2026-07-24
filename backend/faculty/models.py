from django.db import models
from accounts.models import User

class InterviewSlot(models.Model):
    MODE_CHOICES = [
        ('Online', 'Online'),
        ('Offline', 'Offline'),
    ]

    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('Booked', 'Booked'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    faculty = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'faculty'}
    )
    title = models.CharField(max_length=200)
    interview_date = models.DateField()
    interview_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(default=30)
    mode = models.CharField(max_length=20, choices=MODE_CHOICES)
    venue_or_link = models.CharField(max_length=255)
    max_students = models.PositiveIntegerField(default=1)
    remaining_seats = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Available')

    def save(self, *args, **kwargs):
        if not self.pk and (self.remaining_seats == 1 and self.max_students != 1):
            self.remaining_seats = self.max_students
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.interview_date}"