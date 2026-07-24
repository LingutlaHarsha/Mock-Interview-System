from django.contrib import admin
from .models import (
    CodingAssessment,
    CodingQuestion,
    CodingTestCase,
    CodingSubmission,
    CodingResult
)


@admin.register(CodingAssessment)
class CodingAssessmentAdmin(admin.ModelAdmin):
    list_display = ['title', 'faculty', 'difficulty', 'start_date', 'deadline_date', 'status', 'max_marks']
    list_filter = ['status', 'difficulty', 'visibility']
    search_fields = ['title', 'description', 'faculty__username']


@admin.register(CodingQuestion)
class CodingQuestionAdmin(admin.ModelAdmin):
    list_display = ['title', 'assessment', 'difficulty', 'marks', 'order']
    list_filter = ['difficulty']
    search_fields = ['title', 'description']


@admin.register(CodingTestCase)
class CodingTestCaseAdmin(admin.ModelAdmin):
    list_display = ['id', 'question', 'is_hidden']
    list_filter = ['is_hidden']


@admin.register(CodingSubmission)
class CodingSubmissionAdmin(admin.ModelAdmin):
    list_display = ['student', 'assessment', 'question', 'status', 'score', 'submitted_at']
    list_filter = ['status', 'language']
    search_fields = ['student__username', 'question__title']


@admin.register(CodingResult)
class CodingResultAdmin(admin.ModelAdmin):
    list_display = ['student', 'assessment', 'total_score', 'max_score', 'percentage', 'completed_at']
    list_filter = ['status']
    search_fields = ['student__username', 'assessment__title']
