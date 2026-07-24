from django.urls import path
from .views import RegisterAPIView, LoginAPIView, UserProfileAPIView, ChangePasswordAPIView
from .admin_views import (
    PendingFacultyListAPIView,
    ApproveFacultyAPIView,
    RejectFacultyAPIView,
    AdminStudentsListAPIView,
    AdminBroadcastNotificationAPIView,
    AdminFacultyListCreateAPIView,
    AdminFacultyDetailAPIView,
    AdminResetFacultyPasswordAPIView,
    AdminStudentCreateAPIView,
    AdminStudentDetailAPIView,
    AdminResetStudentPasswordAPIView
)

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('me/', UserProfileAPIView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordAPIView.as_view(), name='change-password'),
    
    # Admin routes
    path('admin/faculty/pending/', PendingFacultyListAPIView.as_view(), name='admin-pending-faculty'),
    path('admin/faculty/<int:pk>/approve/', ApproveFacultyAPIView.as_view(), name='admin-approve-faculty'),
    path('admin/faculty/<int:pk>/reject/', RejectFacultyAPIView.as_view(), name='admin-reject-faculty'),
    path('admin/faculty/manage/', AdminFacultyListCreateAPIView.as_view(), name='admin-faculty-manage'),
    path('admin/faculty/<int:pk>/manage/', AdminFacultyDetailAPIView.as_view(), name='admin-faculty-detail-manage'),
    path('admin/faculty/<int:pk>/reset-password/', AdminResetFacultyPasswordAPIView.as_view(), name='admin-faculty-reset-password'),
    path('admin/students/', AdminStudentsListAPIView.as_view(), name='admin-students-list'),
    path('admin/students/create/', AdminStudentCreateAPIView.as_view(), name='admin-student-create'),
    path('admin/students/<int:pk>/manage/', AdminStudentDetailAPIView.as_view(), name='admin-student-detail-manage'),
    path('admin/students/<int:pk>/reset-password/', AdminResetStudentPasswordAPIView.as_view(), name='admin-student-reset-password'),
    path('admin/broadcast/', AdminBroadcastNotificationAPIView.as_view(), name='admin-broadcast'),
]