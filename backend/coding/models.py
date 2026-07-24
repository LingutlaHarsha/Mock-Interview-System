from django.db import models
from accounts.models import User


class CodingAssessment(models.Model):
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]

    VISIBILITY_CHOICES = [
        ('Public', 'Public'),
        ('Department Only', 'Department Only'),
        ('Year Only', 'Year Only'),
        ('Branch Only', 'Branch Only'),
    ]

    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Closed', 'Closed'),
        ('Archived', 'Archived'),
    ]

    faculty = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_coding_assessments')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='Medium')
    allowed_languages = models.JSONField(default=list)  # e.g., ["Python", "Java", "C", "C++", "JavaScript"]
    
    start_date = models.DateField()
    start_time = models.TimeField()
    deadline_date = models.DateField()
    deadline_time = models.TimeField()
    
    duration_minutes = models.IntegerField(default=60, help_text="Duration in minutes (0 for no timer limit)")
    max_marks = models.IntegerField(default=100)
    total_questions_allowed = models.IntegerField(default=5, help_text="Maximum number of questions allowed for this assessment")
    instructions = models.TextField(blank=True, default='')
    topics = models.JSONField(default=list)  # e.g., ["Arrays", "Strings", "DP"]
    
    visibility = models.CharField(max_length=30, choices=VISIBILITY_CHOICES, default='Public')
    branch_filter = models.CharField(max_length=100, blank=True, default='')
    year_filter = models.CharField(max_length=20, blank=True, default='')
    
    allowed_attempts = models.IntegerField(default=1, help_text="1, 2, 3, or 0 for unlimited attempts")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.difficulty}) - By {self.faculty.username}"


class CodingQuestion(models.Model):
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]

    assessment = models.ForeignKey(CodingAssessment, on_delete=models.CASCADE, related_name='questions')
    title = models.CharField(max_length=255)
    description = models.TextField()
    topic = models.CharField(max_length=100, blank=True, default='')
    constraints = models.TextField(blank=True, default='')
    input_format = models.TextField(blank=True, default='')
    output_format = models.TextField(blank=True, default='')
    example_input = models.TextField(blank=True, default='')
    example_output = models.TextField(blank=True, default='')
    explanation = models.TextField(blank=True, default='')
    examples = models.JSONField(default=list)  # [{ "input": "...", "output": "...", "explanation": "..." }]
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='Medium')
    marks = models.IntegerField(default=25)
    order = models.IntegerField(default=1)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.title} ({self.marks} pts)"


class CodingTestCase(models.Model):
    question = models.ForeignKey(CodingQuestion, on_delete=models.CASCADE, related_name='test_cases')
    input_data = models.TextField(blank=True, default='')
    expected_output = models.TextField()
    is_hidden = models.BooleanField(default=False)

    def __str__(self):
        type_str = "Hidden" if self.is_hidden else "Visible"
        return f"TestCase #{self.id} for {self.question.title} ({type_str})"


class CodingSubmission(models.Model):
    STATUS_CHOICES = [
        ('Accepted', 'Accepted'),
        ('Wrong Answer', 'Wrong Answer'),
        ('Runtime Error', 'Runtime Error'),
        ('Time Limit Exceeded', 'Time Limit Exceeded'),
        ('Partial', 'Partial'),
    ]

    assessment = models.ForeignKey(CodingAssessment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='coding_submissions')
    question = models.ForeignKey(CodingQuestion, on_delete=models.CASCADE, related_name='submissions')
    
    language = models.CharField(max_length=30)  # e.g., 'python', 'javascript', 'java', 'c', 'cpp'
    code = models.TextField()
    
    score = models.FloatField(default=0.0)
    max_marks = models.FloatField(default=0.0)
    passed_test_cases = models.IntegerField(default=0)
    total_test_cases = models.IntegerField(default=0)
    
    execution_time_ms = models.FloatField(default=0.0)
    memory_kb = models.FloatField(default=0.0)
    attempt_number = models.IntegerField(default=1)
    
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Wrong Answer')
    test_case_results = models.JSONField(default=list)
    manual_remarks = models.TextField(blank=True, default='')
    
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} - {self.question.title} ({self.status})"


class CodingResult(models.Model):
    assessment = models.ForeignKey(CodingAssessment, on_delete=models.CASCADE, related_name='results')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='coding_results')
    attempt_number = models.IntegerField(default=1)
    
    total_score = models.FloatField(default=0.0)
    max_score = models.FloatField(default=100.0)
    percentage = models.FloatField(default=0.0)
    
    status = models.CharField(max_length=20, default='Completed')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-total_score', 'completed_at']

    def __str__(self):
        return f"{self.student.username} - {self.assessment.title} Score: {self.total_score}/{self.max_score}"
