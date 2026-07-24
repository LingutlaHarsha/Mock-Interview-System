from datetime import datetime, date
from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Max

from accounts.permissions import IsFaculty, IsStudent, IsAdmin
from accounts.models import User
from notifications.models import Notification

from .models import (
    CodingAssessment,
    CodingQuestion,
    CodingTestCase,
    CodingSubmission,
    CodingResult
)
from .serializers import (
    CodingAssessmentSerializer,
    CodingAssessmentDetailSerializer,
    StudentAssessmentDetailSerializer,
    CodingQuestionSerializer,
    CodingTestCaseSerializer,
    CodingSubmissionSerializer,
    CodingResultSerializer
)
from .executor import execute_single_test_case


# ==========================================
# FACULTY API VIEWS
# ==========================================

class FacultyAssessmentListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsFaculty]

    def get(self, request):
        assessments = CodingAssessment.objects.filter(faculty=request.user).order_by('-created_at')
        serializer = CodingAssessmentSerializer(assessments, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CodingAssessmentSerializer(data=request.data)
        if serializer.is_valid():
            assessment = serializer.save(faculty=request.user)

            # Notify all active students (Req 17)
            students = User.objects.filter(role='student')
            for st in students:
                Notification.objects.create(
                    user=st,
                    title="New Technical Assessment Available",
                    message=f'Faculty {request.user.username} created "{assessment.title}". Deadline: {assessment.deadline_date}.'
                )

            return Response(CodingAssessmentSerializer(assessment).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FacultyAssessmentDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsFaculty]

    def get(self, request, pk):
        assessment = get_object_or_404(CodingAssessment, pk=pk, faculty=request.user)
        serializer = CodingAssessmentDetailSerializer(assessment)
        return Response(serializer.data)

    def put(self, request, pk):
        assessment = get_object_or_404(CodingAssessment, pk=pk, faculty=request.user)
        serializer = CodingAssessmentSerializer(assessment, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(CodingAssessmentSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        assessment = get_object_or_404(CodingAssessment, pk=pk, faculty=request.user)
        assessment.delete()
        return Response({"message": "Assessment deleted successfully."}, status=status.HTTP_200_OK)


class FacultyAssessmentDuplicateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsFaculty]

    def post(self, request, pk):
        original = get_object_or_404(CodingAssessment, pk=pk, faculty=request.user)
        
        # Clone Assessment
        duplicate = CodingAssessment.objects.create(
            faculty=request.user,
            title=f"Copy of {original.title}",
            description=original.description,
            difficulty=original.difficulty,
            allowed_languages=original.allowed_languages,
            start_date=original.start_date,
            start_time=original.start_time,
            deadline_date=original.deadline_date,
            deadline_time=original.deadline_time,
            duration_minutes=original.duration_minutes,
            max_marks=original.max_marks,
            instructions=original.instructions,
            topics=original.topics,
            visibility=original.visibility,
            branch_filter=original.branch_filter,
            year_filter=original.year_filter,
            allowed_attempts=original.allowed_attempts,
            status='Active'
        )

        # Clone Questions & Test Cases
        for q in original.questions.all():
            new_q = CodingQuestion.objects.create(
                assessment=duplicate,
                title=q.title,
                description=q.description,
                topic=q.topic,
                constraints=q.constraints,
                input_format=q.input_format,
                output_format=q.output_format,
                example_input=q.example_input,
                example_output=q.example_output,
                explanation=q.explanation,
                examples=q.examples,
                difficulty=q.difficulty,
                marks=q.marks,
                order=q.order
            )
            for tc in q.test_cases.all():
                CodingTestCase.objects.create(
                    question=new_q,
                    input_data=tc.input_data,
                    expected_output=tc.expected_output,
                    is_hidden=tc.is_hidden
                )

        return Response(CodingAssessmentSerializer(duplicate).data, status=status.HTTP_201_CREATED)


class FacultyQuestionListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsFaculty]

    def post(self, request, assessment_pk):
        assessment = get_object_or_404(CodingAssessment, pk=assessment_pk, faculty=request.user)
        
        # Enforce maximum allowed questions limit configured by faculty
        if assessment.total_questions_allowed > 0 and assessment.questions.count() >= assessment.total_questions_allowed:
            raise ValidationError({"detail": f"Question limit reached: This assessment allows a maximum of {assessment.total_questions_allowed} questions."})

        # Enforce total max marks limit if target max_marks is configured
        current_marks = sum(q.marks for q in assessment.questions.all())
        new_marks = int(request.data.get('marks', 25))
        if assessment.max_marks > 0 and (current_marks + new_marks > assessment.max_marks):
            remaining = max(0, assessment.max_marks - current_marks)
            if remaining == 0:
                raise ValidationError({"detail": f"Total marks limit reached: This assessment has already allocated all {assessment.max_marks} total marks."})
            else:
                raise ValidationError({"detail": f"Marks limit exceeded: Adding this question ({new_marks} pts) exceeds total max marks ({assessment.max_marks} pts). Maximum allowed for this question is {remaining} pts."})

        data = request.data.copy()
        data['assessment'] = assessment.id
        serializer = CodingQuestionSerializer(data=data)
        if serializer.is_valid():
            question = serializer.save()
            examples = question.examples or []
            if not examples and (question.example_input or question.example_output):
                examples = [{"input": question.example_input, "output": question.example_output, "explanation": question.explanation}]
                question.examples = examples
                question.save()

            # Auto-generate 1 visible and 1 hidden test case from examples if none exist
            if question.test_cases.count() == 0 and len(examples) > 0:
                for ex in examples:
                    CodingTestCase.objects.create(
                        question=question,
                        input_data=ex.get('input', ''),
                        expected_output=ex.get('output', ''),
                        is_hidden=False
                    )
                    CodingTestCase.objects.create(
                        question=question,
                        input_data=ex.get('input', ''),
                        expected_output=ex.get('output', ''),
                        is_hidden=True
                    )
            return Response(CodingQuestionSerializer(question).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FacultyQuestionDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsFaculty]

    def put(self, request, pk):
        question = get_object_or_404(CodingQuestion, pk=pk, assessment__faculty=request.user)
        
        # Enforce total max marks limit on update
        if 'marks' in request.data:
            assessment = question.assessment
            try:
                new_marks = int(request.data.get('marks', question.marks))
            except (ValueError, TypeError):
                new_marks = question.marks
            
            other_marks = sum(q.marks for q in assessment.questions.exclude(pk=question.pk))
            if assessment.max_marks > 0 and (other_marks + new_marks > assessment.max_marks):
                remaining = max(0, assessment.max_marks - other_marks)
                raise ValidationError({"detail": f"Cannot update question to {new_marks} pts! Total assessment target is {assessment.max_marks} pts ({other_marks} pts allocated to other questions). Maximum allowed for this question is {remaining} pts."})

        serializer = CodingQuestionSerializer(question, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(CodingQuestionSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        question = get_object_or_404(CodingQuestion, pk=pk, assessment__faculty=request.user)
        question.delete()
        return Response({"message": "Question deleted successfully."}, status=status.HTTP_200_OK)


class FacultyTestCaseListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsFaculty]

    def post(self, request, question_pk):
        question = get_object_or_404(CodingQuestion, pk=question_pk, assessment__faculty=request.user)
        data = request.data.copy()
        data['question'] = question.id
        serializer = CodingTestCaseSerializer(data=data)
        if serializer.is_valid():
            tc = serializer.save()
            return Response(CodingTestCaseSerializer(tc).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        tc = get_object_or_404(CodingTestCase, pk=pk, question__assessment__faculty=request.user)
        tc.delete()
        return Response({"message": "Test case removed."}, status=status.HTTP_200_OK)


class FacultySubmissionsListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsFaculty]

    def get(self, request, assessment_pk):
        assessment = get_object_or_404(CodingAssessment, pk=assessment_pk, faculty=request.user)
        submissions = CodingSubmission.objects.filter(assessment=assessment).order_by('-submitted_at')
        serializer = CodingSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)

    def patch(self, request, pk):
        submission = get_object_or_404(CodingSubmission, pk=pk, assessment__faculty=request.user)
        new_score = request.data.get("score")
        remarks = request.data.get("manual_remarks")

        if new_score is not None:
            submission.score = float(new_score)
        if remarks is not None:
            submission.manual_remarks = remarks
        submission.save()

        # Update overall student result
        user_submissions = CodingSubmission.objects.filter(
            assessment=submission.assessment,
            student=submission.student,
            attempt_number=submission.attempt_number
        )
        total = sum(s.score for s in user_submissions)
        result = CodingResult.objects.filter(
            assessment=submission.assessment,
            student=submission.student,
            attempt_number=submission.attempt_number
        ).first()
        if result:
            result.total_score = total
            result.percentage = round((total / result.max_score * 100), 1) if result.max_score > 0 else 0.0
            result.save()

        # Notify student (Req 17)
        Notification.objects.create(
            user=submission.student,
            title="Coding Assessment Evaluated",
            message=f'Your submission for "{submission.question.title}" in "{submission.assessment.title}" has been reviewed by faculty.'
        )

        return Response(CodingSubmissionSerializer(submission).data)


class FacultyLeaderboardAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsFaculty]

    def get(self, request, assessment_pk):
        assessment = get_object_or_404(CodingAssessment, pk=assessment_pk)
        results = CodingResult.objects.filter(assessment=assessment).order_by('-total_score', 'completed_at')
        serializer = CodingResultSerializer(results, many=True)
        
        # Format with rank & attempt details
        data = []
        for index, r in enumerate(serializer.data, start=1):
            item = r.copy()
            item['rank'] = index
            data.append(item)
        return Response(data)


# ==========================================
# STUDENT API VIEWS
# ==========================================

class StudentAssessmentListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        now = datetime.now()
        assessments = CodingAssessment.objects.filter(status='Active').order_by('-created_at')
        
        result = []
        for a in assessments:
            start_dt = datetime.combine(a.start_date, a.start_time)
            end_dt = datetime.combine(a.deadline_date, a.deadline_time)
            
            is_started = now >= start_dt
            is_expired = now > end_dt

            # User attempt check
            user_attempts = CodingResult.objects.filter(assessment=a, student=request.user).count()
            has_attempted = user_attempts > 0
            limit_reached = a.allowed_attempts > 0 and user_attempts >= a.allowed_attempts
            remaining_attempts = (a.allowed_attempts - user_attempts) if a.allowed_attempts > 0 else "Unlimited"

            result.append({
                "id": a.id,
                "title": a.title,
                "description": a.description,
                "faculty_name": a.faculty.username,
                "difficulty": a.difficulty,
                "allowed_languages": a.allowed_languages,
                "start_date": a.start_date,
                "start_time": a.start_time,
                "deadline_date": a.deadline_date,
                "deadline_time": a.deadline_time,
                "duration_minutes": a.duration_minutes,
                "max_marks": a.max_marks,
                "instructions": a.instructions,
                "topics": a.topics,
                "questions_count": a.questions.count(),
                "is_started": is_started,
                "is_expired": is_expired,
                "user_attempts": user_attempts,
                "allowed_attempts": a.allowed_attempts,
                "remaining_attempts": remaining_attempts,
                "has_attempted": has_attempted,
                "limit_reached": limit_reached
            })

        return Response(result)


class StudentAssessmentDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        assessment = get_object_or_404(CodingAssessment, pk=pk)
        
        # Check deadline
        now = datetime.now()
        end_dt = datetime.combine(assessment.deadline_date, assessment.deadline_time)
        
        user_attempts = CodingResult.objects.filter(assessment=assessment, student=request.user).count()
        allowed_attempts = assessment.allowed_attempts
        remaining_attempts = max(0, allowed_attempts - user_attempts) if allowed_attempts > 0 else 999
        latest_sub = CodingSubmission.objects.filter(assessment=assessment, student=request.user).order_by('-submitted_at').first()

        # Serializes with ONLY visible test cases!
        serializer = StudentAssessmentDetailSerializer(assessment)
        data = serializer.data
        data['attempts_used'] = user_attempts
        data['allowed_attempts'] = allowed_attempts
        data['remaining_attempts'] = remaining_attempts
        data['latest_submission_id'] = latest_sub.id if latest_sub else None
        data['is_locked'] = (allowed_attempts > 0 and user_attempts >= allowed_attempts)
        data['is_expired'] = now > end_dt
        return Response(data)


class RunCodeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        question_id = request.data.get("question")
        language = request.data.get("language", "python")
        code = request.data.get("code", "")

        if not question_id or not code:
            raise ValidationError({"detail": "Question ID and Code are required."})

        question = get_object_or_404(CodingQuestion, pk=question_id)
        visible_test_cases = list(question.test_cases.filter(is_hidden=False))

        # Fallback to examples if test_cases model has no visible cases
        if len(visible_test_cases) == 0 and question.examples:
            for ex in question.examples:
                visible_test_cases.append(type('TC', (), {
                    'id': 0,
                    'input_data': ex.get('input', ''),
                    'expected_output': ex.get('output', ''),
                    'is_hidden': False
                }))

        results = []
        total_time = 0.0
        total_memory = 0.0
        passed_count = 0

        for tc in visible_test_cases:
            res = execute_single_test_case(language, code, tc.input_data, tc.expected_output)
            total_time += res['execution_time_ms']
            total_memory = max(total_memory, res['memory_kb'])
            if res['passed']:
                passed_count += 1

            results.append({
                "test_case_id": getattr(tc, 'id', 0),
                "input": tc.input_data,
                "expected_output": tc.expected_output,
                "actual_output": res['actual_output'],
                "passed": res['passed'],
                "execution_time_ms": res['execution_time_ms'],
                "error_message": res['error_message']
            })

        total_count = len(visible_test_cases)
        failed_count = total_count - passed_count

        return Response({
            "all_passed": passed_count == total_count and total_count > 0,
            "total_test_cases": total_count,
            "passed_count": passed_count,
            "failed_count": failed_count,
            "execution_time_ms": round(total_time, 2),
            "memory_kb": round(total_memory, 1),
            "results": results
        })


class SubmitCodeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        assessment_id = request.data.get("assessment")
        submissions_data = request.data.get("submissions")

        # Support single-question payload as fallback
        if not submissions_data:
            question_id = request.data.get("question")
            language = request.data.get("language", "python")
            code = request.data.get("code", "")
            if question_id and code:
                submissions_data = [{
                    "question": question_id,
                    "language": language,
                    "code": code
                }]

        if not assessment_id or not submissions_data:
            raise ValidationError({"detail": "Assessment ID and question submissions are required."})

        assessment = get_object_or_404(CodingAssessment, pk=assessment_id)

        # Check deadline
        now = datetime.now()
        end_dt = datetime.combine(assessment.deadline_date, assessment.deadline_time)
        if now > end_dt:
            raise ValidationError({"detail": "This coding assessment deadline has passed."})

        # Check attempt limits
        user_submissions = CodingSubmission.objects.filter(assessment=assessment, student=request.user)
        if user_submissions.exists():
            current_attempt = (user_submissions.aggregate(Max('attempt_number'))['attempt_number__max'] or 1)
        else:
            current_attempt = 1

        existing_results = CodingResult.objects.filter(assessment=assessment, student=request.user)
        total_completed_attempts = existing_results.count()

        if assessment.allowed_attempts > 0 and total_completed_attempts >= assessment.allowed_attempts:
            has_existing_sub_in_attempt = user_submissions.filter(attempt_number=current_attempt).exists()
            if not has_existing_sub_in_attempt:
                raise ValidationError({"detail": f"Assessment locked: Maximum attempt limit reached ({assessment.allowed_attempts} attempt(s) allowed)."})

        created_submissions = []
        last_submission = None

        for sub_item in submissions_data:
            q_id = sub_item.get("question")
            lang = sub_item.get("language", "python")
            code_text = sub_item.get("code", "")

            if not q_id or not code_text:
                continue

            try:
                question = CodingQuestion.objects.get(pk=q_id, assessment=assessment)
            except CodingQuestion.DoesNotExist:
                continue

            # Run against ALL test cases (visible + hidden)
            all_test_cases = list(question.test_cases.all())
            if len(all_test_cases) == 0 and question.examples:
                for ex in question.examples:
                    all_test_cases.append(type('TC', (), {
                        'id': 0,
                        'input_data': ex.get('input', ''),
                        'expected_output': ex.get('output', ''),
                        'is_hidden': False
                    }))

            hidden_cases = [tc for tc in all_test_cases if getattr(tc, 'is_hidden', False)]
            eval_cases = hidden_cases if len(hidden_cases) > 0 else all_test_cases

            tc_results = []
            passed_count = 0
            passed_eval_count = 0
            total_time = 0.0
            max_memory = 0.0

            for tc in all_test_cases:
                res = execute_single_test_case(lang, code_text, tc.input_data, tc.expected_output)
                total_time += res['execution_time_ms']
                max_memory = max(max_memory, res['memory_kb'])

                if res['passed']:
                    passed_count += 1
                    if tc in eval_cases:
                        passed_eval_count += 1

                tc_results.append({
                    "test_case_id": getattr(tc, 'id', 0),
                    "is_hidden": getattr(tc, 'is_hidden', False),
                    "passed": res['passed'],
                    "execution_time_ms": res['execution_time_ms'],
                    "error_message": res['error_message'],
                    "input": tc.input_data if not getattr(tc, 'is_hidden', False) else "[Hidden]",
                    "expected_output": tc.expected_output if not getattr(tc, 'is_hidden', False) else "[Hidden]",
                    "actual_output": res['actual_output'] if not getattr(tc, 'is_hidden', False) else "[Hidden]"
                })

            total_tc = len(all_test_cases)
            total_eval_tc = len(eval_cases)
            score = round((passed_eval_count / total_eval_tc * question.marks), 2) if total_eval_tc > 0 else 0.0

            if passed_count == total_tc and total_tc > 0:
                sub_status = 'Accepted'
            elif passed_count > 0:
                sub_status = 'Partial'
            else:
                sub_status = 'Wrong Answer'

            submission = CodingSubmission.objects.create(
                assessment=assessment,
                student=request.user,
                question=question,
                language=lang,
                code=code_text,
                score=score,
                max_marks=question.marks,
                passed_test_cases=passed_count,
                total_test_cases=total_tc,
                execution_time_ms=round(total_time, 2),
                memory_kb=round(max_memory, 1),
                attempt_number=current_attempt,
                status=sub_status,
                test_case_results=tc_results
            )
            created_submissions.append(submission)
            last_submission = submission

        # Update or create overall CodingResult for this student
        student_subs = CodingSubmission.objects.filter(
            assessment=assessment,
            student=request.user,
            attempt_number=current_attempt
        )
        total_score = sum(s.score for s in student_subs)
        pct = round((total_score / assessment.max_marks * 100), 1) if assessment.max_marks > 0 else 0.0

        result_obj, created = CodingResult.objects.get_or_create(
            assessment=assessment,
            student=request.user,
            attempt_number=current_attempt,
            defaults={
                "total_score": total_score,
                "max_score": assessment.max_marks,
                "percentage": pct,
                "status": "Completed"
            }
        )
        if not created:
            result_obj.total_score = total_score
            result_obj.percentage = pct
            result_obj.save()

        # Notifications
        Notification.objects.create(
            user=request.user,
            title="Coding Assessment Submitted",
            message=f'Your submission for "{assessment.title}" scored {total_score}/{assessment.max_marks} pts.'
        )

        user_attempts = CodingResult.objects.filter(assessment=assessment, student=request.user).count()

        return Response({
            "message": "Submission processed successfully!",
            "submission_id": last_submission.id if last_submission else None,
            "total_score": total_score,
            "max_marks": assessment.max_marks,
            "percentage": pct,
            "submissions_count": len(created_submissions),
            "attempt_number": current_attempt,
            "attempts_used": user_attempts
        }, status=status.HTTP_201_CREATED)


class StudentAttemptsListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        submissions = CodingSubmission.objects.filter(student=request.user).order_by('-submitted_at')
        serializer = CodingSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)


class StudentSubmissionDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        submission = get_object_or_404(CodingSubmission, pk=pk)

        # Permission guard: Student can view their own, Faculty/Admin can view any
        if request.user.role == 'student' and submission.student != request.user:
            raise ValidationError({"detail": "You do not have permission to view this submission."})

        # Fetch ALL question submissions for the same student and attempt number
        all_attempt_subs = CodingSubmission.objects.filter(
            assessment=submission.assessment,
            student=submission.student,
            attempt_number=submission.attempt_number
        ).order_by('question__order', 'id')

        primary_data = CodingSubmissionSerializer(submission).data
        all_subs_data = CodingSubmissionSerializer(all_attempt_subs, many=True).data

        attempt_total_score = sum(s.score for s in all_attempt_subs)
        attempt_max_marks = submission.assessment.max_marks or sum(s.max_marks for s in all_attempt_subs)

        primary_data['all_submissions'] = all_subs_data
        primary_data['attempt_total_score'] = round(attempt_total_score, 2)
        primary_data['attempt_max_marks'] = attempt_max_marks
        primary_data['questions_count'] = len(all_subs_data)

        return Response(primary_data)


import html
import re
import urllib.request
import json

class ParseLeetCodeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsFaculty]

    def post(self, request):
        url_or_title = request.data.get("url", "").strip()
        if not url_or_title:
            raise ValidationError({"detail": "LeetCode URL or problem title is required."})

        slug = url_or_title
        if 'leetcode.com/problems/' in slug:
            match = re.search(r'leetcode\.com/problems/([^/]+)', slug)
            if match:
                slug = match.group(1)

        slug = slug.strip().lower().replace(' ', '-')

        gql_url = "https://leetcode.com/graphql"
        query = """
        query getQuestionDetail($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
                title
                difficulty
                content
                exampleTestcaseList
                topicTags {
                    name
                }
            }
        }
        """

        payload = {
            "query": query,
            "variables": {"titleSlug": slug}
        }

        try:
            req = urllib.request.Request(
                gql_url,
                data=json.dumps(payload).encode('utf-8'),
                headers={
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                }
            )
            res = urllib.request.urlopen(req, timeout=10)
            data = json.loads(res.read().decode('utf-8'))
            q = data.get('data', {}).get('question')

            if not q:
                return Response({"detail": f"Could not find LeetCode problem for '{slug}'. Check URL or title."}, status=status.HTTP_404_NOT_FOUND)

            html_content = q.get('content', '')

            # Extract Constraints block using regex
            constraints = ""
            c_match = re.search(r'Constraints:\s*</span>\s*<ul>([\s\S]*?)</ul>', html_content, re.IGNORECASE)
            if not c_match:
                c_match = re.search(r'Constraints:[\s\S]*?<ul>([\s\S]*?)</ul>', html_content, re.IGNORECASE)
            if c_match:
                lis = re.findall(r'<li>([\s\S]*?)</li>', c_match.group(1))
                cleaned_lis = [html.unescape(re.sub(r'<[^>]+>', '', li).strip()) for li in lis]
                constraints = "\n".join(cleaned_lis)

            if not constraints:
                c_match_fallback = re.search(r'Constraints:([\s\S]*?)(?:<p>|</body>|\Z)', html_content, re.IGNORECASE)
                if c_match_fallback:
                    constraints = html.unescape(re.sub(r'<[^>]+>', '', c_match_fallback.group(1)).strip())

            # Clean HTML to plain text for description
            text_desc = re.sub(r'<pre>[\s\S]*?</pre>', '', html_content)
            text_desc = re.sub(r'<[^>]+>', '', text_desc).strip()
            text_desc = re.sub(r'\n\s*\n', '\n\n', text_desc)
            text_desc = html.unescape(text_desc)

            description = text_desc
            if 'Example 1:' in text_desc:
                description = text_desc.split('Example 1:')[0].strip()
            elif 'Constraints:' in text_desc:
                description = text_desc.split('Constraints:')[0].strip()

            # Parse Examples
            examples = []
            example_blocks = re.findall(r'<pre>([\s\S]*?)</pre>', html_content)
            for b in example_blocks:
                clean_b = html.unescape(re.sub(r'<[^>]+>', '', b).strip())
                inp = re.search(r'Input:\s*(.*?)(?:\n|Output:|\Z)', clean_b)
                out = re.search(r'Output:\s*(.*?)(?:\n|Explanation:|\Z)', clean_b)
                exp = re.search(r'Explanation:\s*(.*)', clean_b, re.DOTALL)

                if inp and out:
                    examples.append({
                        "input": inp.group(1).strip(),
                        "output": out.group(1).strip(),
                        "explanation": exp.group(1).strip() if exp else ""
                    })

            tc_list = q.get('exampleTestcaseList', [])
            if not examples and tc_list:
                for tc in tc_list:
                    examples.append({"input": tc, "output": "See problem specification", "explanation": ""})

            topics = [t.get('name') for t in q.get('topicTags', [])]
            diff = q.get('difficulty', 'Medium')
            marks = 15 if diff == 'Easy' else 25 if diff == 'Medium' else 35

            return Response({
                "title": q.get('title'),
                "difficulty": diff,
                "marks": marks,
                "description": description.strip(),
                "constraints": constraints.strip(),
                "examples": examples,
                "topic": topics[0] if topics else "Algorithms"
            })

        except Exception as e:
            return Response({"detail": f"Failed to fetch LeetCode data: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


class AdminSubmissionsListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        submissions = CodingSubmission.objects.all().order_by('-submitted_at')
        serializer = CodingSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)
