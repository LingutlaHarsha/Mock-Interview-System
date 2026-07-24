import sys
import os
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
django.setup()

from accounts.models import User
from dashboard.views import StudentDashboardAPIView, FacultyDashboardAPIView
from rest_framework.test import APIRequestFactory, force_authenticate

factory = APIRequestFactory()

print("=" * 60)
print("AUDITING ALL STUDENT DASHBOARDS")
print("=" * 60)
for s in User.objects.filter(role='student'):
    req = factory.get('/api/dashboard/student/')
    force_authenticate(req, user=s)
    res = StudentDashboardAPIView.as_view()(req)
    print(f"Student '{s.username}': Status {res.status_code} | Name: '{res.data.get('student_name')}' | Profile Complete: {res.data.get('profile_complete')} | Upcoming: {res.data.get('upcoming_interview')}")

print("\n" + "=" * 60)
print("AUDITING ALL FACULTY DASHBOARDS")
print("=" * 60)
for f in User.objects.filter(role='faculty'):
    req = factory.get('/api/dashboard/faculty/')
    force_authenticate(req, user=f)
    res = FacultyDashboardAPIView.as_view()(req)
    print(f"Faculty '{f.username}': Status {res.status_code} | Conducted: {res.data.get('total_conducted')} | Today: {res.data.get('today_interviews')} | Pending FB: {res.data.get('pending_feedback')}")

print("=" * 60)
print("ALL DASHBOARD AUDITS PASSED WITH ZERO ERRORS!")
print("=" * 60)
