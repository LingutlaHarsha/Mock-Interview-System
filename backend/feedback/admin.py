from django.contrib import admin
from .models import Feedback

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'rating', 'recommendation')
    list_filter = ('rating', 'recommendation')
    search_fields = ('booking__student__username', 'comments', 'strengths')

