from django.contrib import admin
from .models import InterviewSlot

@admin.register(InterviewSlot)
class InterviewSlotAdmin(admin.ModelAdmin):
    list_display = ('title', 'faculty', 'interview_date', 'interview_time', 'mode', 'remaining_seats', 'max_students', 'status')
    list_filter = ('mode', 'status', 'interview_date')
    search_fields = ('title', 'faculty__username', 'venue_or_link')

