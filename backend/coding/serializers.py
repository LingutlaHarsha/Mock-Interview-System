from rest_framework import serializers
from .models import (
    CodingAssessment,
    CodingQuestion,
    CodingTestCase,
    CodingSubmission,
    CodingResult
)


class CodingTestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodingTestCase
        fields = ['id', 'question', 'input_data', 'expected_output', 'is_hidden']


class VisibleTestCaseSerializer(serializers.ModelSerializer):
    """Serializer used for student requests (never exposes expected_output of hidden test cases)."""
    class Meta:
        model = CodingTestCase
        fields = ['id', 'question', 'input_data', 'expected_output', 'is_hidden']


class CodingQuestionSerializer(serializers.ModelSerializer):
    test_cases = CodingTestCaseSerializer(many=True, read_only=True)

    class Meta:
        model = CodingQuestion
        fields = [
            'id', 'assessment', 'title', 'description', 'topic', 'constraints',
            'input_format', 'output_format', 'example_input', 'example_output',
            'explanation', 'examples', 'difficulty', 'marks', 'order', 'test_cases', 'created_at'
        ]


class StudentCodingQuestionSerializer(serializers.ModelSerializer):
    """Student view of question: excludes hidden test cases from test_cases list!"""
    visible_test_cases = serializers.SerializerMethodField()

    class Meta:
        model = CodingQuestion
        fields = [
            'id', 'assessment', 'title', 'description', 'topic', 'constraints',
            'input_format', 'output_format', 'example_input', 'example_output',
            'explanation', 'examples', 'difficulty', 'marks', 'order', 'visible_test_cases', 'created_at'
        ]

    def get_visible_test_cases(self, obj):
        visible_cases = obj.test_cases.filter(is_hidden=False)
        return VisibleTestCaseSerializer(visible_cases, many=True).data


class CodingAssessmentSerializer(serializers.ModelSerializer):
    faculty = serializers.PrimaryKeyRelatedField(read_only=True)
    faculty_name = serializers.CharField(source='faculty.username', read_only=True)
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = CodingAssessment
        fields = [
            'id', 'faculty', 'faculty_name', 'title', 'description',
            'difficulty', 'allowed_languages', 'start_date', 'start_time',
            'deadline_date', 'deadline_time', 'duration_minutes', 'max_marks',
            'total_questions_allowed', 'instructions', 'topics', 'visibility',
            'branch_filter', 'year_filter', 'allowed_attempts', 'status',
            'questions_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['faculty', 'created_at', 'updated_at']

    def get_questions_count(self, obj):
        return obj.questions.count()


class CodingAssessmentDetailSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source='faculty.username', read_only=True)
    questions = CodingQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = CodingAssessment
        fields = [
            'id', 'faculty', 'faculty_name', 'title', 'description',
            'difficulty', 'allowed_languages', 'start_date', 'start_time',
            'deadline_date', 'deadline_time', 'duration_minutes', 'max_marks',
            'total_questions_allowed', 'instructions', 'topics', 'visibility',
            'branch_filter', 'year_filter', 'allowed_attempts', 'status',
            'questions', 'created_at', 'updated_at'
        ]


class StudentAssessmentDetailSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source='faculty.username', read_only=True)
    questions = StudentCodingQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = CodingAssessment
        fields = [
            'id', 'faculty', 'faculty_name', 'title', 'description',
            'difficulty', 'allowed_languages', 'start_date', 'start_time',
            'deadline_date', 'deadline_time', 'duration_minutes', 'max_marks',
            'total_questions_allowed', 'instructions', 'topics', 'visibility',
            'branch_filter', 'year_filter', 'allowed_attempts', 'status',
            'questions', 'created_at', 'updated_at'
        ]


class CodingSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    question_title = serializers.CharField(source='question.title', read_only=True)
    assessment_title = serializers.CharField(source='assessment.title', read_only=True)

    class Meta:
        model = CodingSubmission
        fields = [
            'id', 'assessment', 'assessment_title', 'student', 'student_name',
            'student_email', 'question', 'question_title', 'language', 'code',
            'score', 'max_marks', 'passed_test_cases', 'total_test_cases',
            'execution_time_ms', 'memory_kb', 'attempt_number', 'status',
            'test_case_results', 'manual_remarks', 'submitted_at'
        ]


class CodingResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    assessment_title = serializers.CharField(source='assessment.title', read_only=True)

    class Meta:
        model = CodingResult
        fields = [
            'id', 'assessment', 'assessment_title', 'student', 'student_name',
            'student_email', 'attempt_number', 'total_score', 'max_score',
            'percentage', 'status', 'started_at', 'completed_at'
        ]
