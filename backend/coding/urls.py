from django.urls import path
from .views import (
    # Faculty
    FacultyAssessmentListCreateAPIView,
    FacultyAssessmentDetailAPIView,
    FacultyAssessmentDuplicateAPIView,
    FacultyQuestionListCreateAPIView,
    FacultyQuestionDetailAPIView,
    FacultyTestCaseListCreateAPIView,
    FacultySubmissionsListAPIView,
    FacultyLeaderboardAPIView,
    ParseLeetCodeAPIView,
    # Student
    StudentAssessmentListAPIView,
    StudentAssessmentDetailAPIView,
    RunCodeAPIView,
    SubmitCodeAPIView,
    StudentAttemptsListAPIView,
    StudentSubmissionDetailAPIView,
    AdminSubmissionsListAPIView
)

urlpatterns = [
    # Faculty Routes
    path("faculty/assessments/", FacultyAssessmentListCreateAPIView.as_view(), name="faculty-assessments-list-create"),
    path("faculty/assessments/<int:pk>/", FacultyAssessmentDetailAPIView.as_view(), name="faculty-assessment-detail"),
    path("faculty/assessments/<int:pk>/duplicate/", FacultyAssessmentDuplicateAPIView.as_view(), name="faculty-assessment-duplicate"),
    path("faculty/assessments/<int:assessment_pk>/questions/", FacultyQuestionListCreateAPIView.as_view(), name="faculty-question-create"),
    path("faculty/questions/<int:pk>/", FacultyQuestionDetailAPIView.as_view(), name="faculty-question-detail"),
    path("faculty/questions/<int:question_pk>/test-cases/", FacultyTestCaseListCreateAPIView.as_view(), name="faculty-testcase-create"),
    path("faculty/test-cases/<int:pk>/", FacultyTestCaseListCreateAPIView.as_view(), name="faculty-testcase-delete"),
    path("faculty/assessments/<int:assessment_pk>/submissions/", FacultySubmissionsListAPIView.as_view(), name="faculty-submissions-list"),
    path("faculty/submissions/<int:pk>/", FacultySubmissionsListAPIView.as_view(), name="faculty-submission-update"),
    path("faculty/assessments/<int:assessment_pk>/leaderboard/", FacultyLeaderboardAPIView.as_view(), name="faculty-leaderboard"),
    path("faculty/parse-leetcode/", ParseLeetCodeAPIView.as_view(), name="faculty-parse-leetcode"),

    # Student Routes
    path("student/assessments/", StudentAssessmentListAPIView.as_view(), name="student-assessments-list"),
    path("student/assessments/<int:pk>/", StudentAssessmentDetailAPIView.as_view(), name="student-assessment-detail"),
    path("student/run/", RunCodeAPIView.as_view(), name="student-run-code"),
    path("student/submit/", SubmitCodeAPIView.as_view(), name="student-submit-code"),
    path("student/attempts/", StudentAttemptsListAPIView.as_view(), name="student-attempts-list"),
    path("student/submissions/<int:pk>/", StudentSubmissionDetailAPIView.as_view(), name="student-submission-detail"),

    # Top-Level Direct API Routes
    path("run/", RunCodeAPIView.as_view(), name="top-run-code"),
    path("submit/", SubmitCodeAPIView.as_view(), name="top-submit-code"),
    path("result/<int:pk>/", StudentSubmissionDetailAPIView.as_view(), name="top-submission-result"),
    path("my-attempts/", StudentAttemptsListAPIView.as_view(), name="top-my-attempts"),
    path("faculty-submissions/", FacultySubmissionsListAPIView.as_view(), name="top-faculty-submissions"),
    path("admin-submissions/", AdminSubmissionsListAPIView.as_view(), name="top-admin-submissions"),
]
