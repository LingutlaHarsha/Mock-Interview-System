from django.db import models
from accounts.models import User

class StudentProfile(models.Model):
    YEAR_CHOICES = [
        ('1', '1st Year'),
        ('2', '2nd Year'),
        ('3', '3rd Year'),
        ('4', '4th Year'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100, blank=True, default='')
    roll_number = models.CharField(max_length=50, unique=True)
    branch = models.CharField(max_length=100, blank=True, default='General')
    year = models.CharField(max_length=10, choices=YEAR_CHOICES, default='1')
    phone = models.CharField(max_length=15, blank=True, default='')
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=0.00, blank=True, null=True)
    skills = models.TextField(blank=True, default='')
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)

    def __str__(self):
        return self.full_name or self.user.username