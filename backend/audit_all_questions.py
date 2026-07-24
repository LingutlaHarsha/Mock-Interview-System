import sys
import os
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
django.setup()

from coding.models import CodingAssessment, CodingQuestion, CodingTestCase

print("=" * 60)
print("AUDITING ALL QUESTIONS & TEST CASES ACROSS ASSESSMENTS")
print("=" * 60)

for a in CodingAssessment.objects.all():
    print(f"\nASSESSMENT #{a.id}: '{a.title}'")
    for q in a.questions.all():
        tcs = q.test_cases.all()
        print(f"  Q#{q.id}: '{q.title}' ({tcs.count()} test cases)")
        for tc in tcs:
            print(f"    - TC#{tc.id} [hidden={tc.is_hidden}]: input={repr(tc.input_data)} | expected={repr(tc.expected_output)}")

print("\n" + "=" * 60)
print("AUDIT COMPLETE")
print("=" * 60)
