from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'interview_slot', 'status', 'booked_at')
    list_filter = ('status', 'booked_at')
    search_fields = ('student__username', 'interview_slot__title')

