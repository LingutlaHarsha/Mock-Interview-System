from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated

from .models import User
from accounts.permissions import IsAdmin
from students.models import StudentProfile
from students.serializers import StudentProfileSerializer
from notifications.models import Notification


class PendingFacultyListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        pending_faculty = User.objects.filter(role='faculty', is_approved=False).order_by('-date_joined')
        data = [
            {
                "id": f.id,
                "username": f.username,
                "email": f.email,
                "date_joined": f.date_joined,
                "is_approved": f.is_approved
            }
            for f in pending_faculty
        ]
        return Response(data)


class ApproveFacultyAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def put(self, request, pk):
        try:
            faculty_user = User.objects.get(pk=pk, role='faculty')
            faculty_user.is_approved = True
            faculty_user.save()

            # Create notification for faculty
            Notification.objects.create(
                user=faculty_user,
                title="Account Approved",
                message="Your faculty account has been approved by the administrator. You may now log in and manage interview slots."
            )

            return Response({"message": f"Faculty {faculty_user.username} approved successfully."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"detail": "Faculty user not found."}, status=status.HTTP_404_NOT_FOUND)


class RejectFacultyAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, pk):
        try:
            faculty_user = User.objects.get(pk=pk, role='faculty')
            username = faculty_user.username
            faculty_user.delete()
            return Response({"message": f"Faculty {username} application rejected and account removed."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"detail": "Faculty user not found."}, status=status.HTTP_404_NOT_FOUND)


class AdminStudentsListAPIView(generics.ListAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = StudentProfile.objects.all().order_by('-id')


class AdminBroadcastNotificationAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        target_role = request.data.get('target_role', 'all')
        title = request.data.get('title', 'System Announcement')
        message = request.data.get('message', '')

        if not message:
            return Response({"detail": "Message content is required."}, status=status.HTTP_400_BAD_REQUEST)

        if target_role == 'student':
            users = User.objects.filter(role='student')
        elif target_role == 'faculty':
            users = User.objects.filter(role='faculty', is_approved=True)
        else:
            users = User.objects.all()

        notifications = [
            Notification(user=u, title=title, message=message)
            for u in users
        ]
        Notification.objects.bulk_create(notifications)

        return Response({"message": f"Announcement broadcasted to {len(notifications)} users."}, status=status.HTTP_201_CREATED)


class AdminFacultyListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        faculty_users = User.objects.filter(role='faculty').order_by('-date_joined')
        data = [
            {
                "id": f.id,
                "username": f.username,
                "email": f.email,
                "date_joined": f.date_joined,
                "is_approved": f.is_approved,
                "is_active": f.is_active
            }
            for f in faculty_users
        ]
        return Response(data)

    def post(self, request):
        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '').strip() or 'Faculty@123'

        if not username or not email:
            return Response({"detail": "Username and email are required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"detail": f"Username '{username}' is already taken."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            username=username,
            email=email,
            role='faculty',
            is_approved=True
        )
        user.set_password(password)
        user.save()

        # Send notification to new faculty
        Notification.objects.create(
            user=user,
            title="Faculty Account Created",
            message=f"Welcome! Your faculty account has been created by the admin. Default password is: {password}"
        )

        return Response({
            "message": f"Faculty user '{username}' created successfully! Default password is: {password}",
            "id": user.id,
            "username": user.username,
            "email": user.email
        }, status=status.HTTP_201_CREATED)


class AdminFacultyDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, pk):
        try:
            faculty_user = User.objects.get(pk=pk, role='faculty')
            username = faculty_user.username
            faculty_user.delete()
            return Response({"message": f"Faculty user '{username}' deleted successfully from database."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"detail": "Faculty user not found."}, status=status.HTTP_404_NOT_FOUND)


class AdminResetFacultyPasswordAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            faculty_user = User.objects.get(pk=pk, role='faculty')
            new_password = request.data.get('new_password', '').strip() or 'Faculty@123'

            faculty_user.set_password(new_password)
            faculty_user.save()

            Notification.objects.create(
                user=faculty_user,
                title="Password Reset by Admin",
                message=f"Your faculty account password has been reset by the administrator to: {new_password}"
            )

            return Response({"message": f"Password for faculty '{faculty_user.username}' reset successfully to default ({new_password})."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"detail": "Faculty user not found."}, status=status.HTTP_404_NOT_FOUND)


class AdminStudentCreateAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '').strip() or 'Student@123'
        full_name = request.data.get('full_name', '').strip() or username
        roll_number = request.data.get('roll_number', '').strip()
        branch = request.data.get('branch', 'General').strip()
        year = request.data.get('year', '1')
        phone = request.data.get('phone', '').strip()
        cgpa = request.data.get('cgpa', 0.0)

        if not username or not email:
            return Response({"detail": "Username and email are required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"detail": f"Username '{username}' is already taken."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            username=username,
            email=email,
            role='student'
        )
        user.set_password(password)
        user.save()

        # Update student profile
        profile, created = StudentProfile.objects.get_or_create(user=user)
        profile.full_name = full_name
        profile.roll_number = roll_number
        profile.branch = branch
        profile.year = str(year)
        profile.phone = phone
        try:
            profile.cgpa = float(cgpa)
        except (ValueError, TypeError):
            profile.cgpa = 0.0
        profile.save()

        Notification.objects.create(
            user=user,
            title="Student Account Created",
            message=f"Welcome! Your student placement portal account has been created by the administrator. Default password is: {password}"
        )

        return Response({
            "message": f"Student account '{username}' created successfully! Default password is: {password}",
            "id": user.id,
            "username": user.username,
            "email": user.email
        }, status=status.HTTP_201_CREATED)


class AdminStudentDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, pk):
        try:
            # pk can be user id or profile id
            try:
                profile = StudentProfile.objects.get(pk=pk)
                user = profile.user
            except StudentProfile.DoesNotExist:
                user = User.objects.get(pk=pk, role='student')

            username = user.username
            user.delete()
            return Response({"message": f"Student user '{username}' deleted successfully from database."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"detail": "Student user not found."}, status=status.HTTP_404_NOT_FOUND)


class AdminResetStudentPasswordAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            try:
                profile = StudentProfile.objects.get(pk=pk)
                user = profile.user
            except StudentProfile.DoesNotExist:
                user = User.objects.get(pk=pk, role='student')

            new_password = request.data.get('new_password', '').strip() or 'Student@123'
            user.set_password(new_password)
            user.save()

            Notification.objects.create(
                user=user,
                title="Password Reset by Admin",
                message=f"Your student account password has been reset by the administrator to: {new_password}"
            )

            return Response({"message": f"Password for student '{user.username}' reset successfully to default ({new_password})."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"detail": "Student user not found."}, status=status.HTTP_404_NOT_FOUND)
