import sys
import os
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
django.setup()

from coding.models import CodingQuestion, CodingTestCase

print("=" * 60)
print("FIXING QUESTION TEST CASES IN DATABASE")
print("=" * 60)

# 1. Update Q12, Q14, Q16 (Longest Substring Without Repeating Characters)
for q_id in [12, 14, 16]:
    try:
        q = CodingQuestion.objects.get(pk=q_id)
        q.description = "Given a string s, find the length of the longest substring without repeating characters."
        q.examples = [
            {"input": "abcabcbb", "output": "3", "explanation": "The answer is 'abc', with the length of 3."},
            {"input": "bbbbb", "output": "1", "explanation": "The answer is 'b', with the length of 1."}
        ]
        q.save()
        
        # Clear existing bad test cases
        q.test_cases.all().delete()
        
        # Create accurate visible & hidden test cases
        CodingTestCase.objects.create(question=q, input_data="abcabcbb", expected_output="3", is_hidden=False)
        CodingTestCase.objects.create(question=q, input_data="bbbbb", expected_output="1", is_hidden=False)
        CodingTestCase.objects.create(question=q, input_data="pwwkew", expected_output="3", is_hidden=True)
        CodingTestCase.objects.create(question=q, input_data="au", expected_output="2", is_hidden=True)
        print(f"[OK] Updated Q{q_id} ({q.title}) with correct LeetCode #3 test cases!")
    except CodingQuestion.DoesNotExist:
        pass

# 2. Update Q15 (Median of Two Sorted Arrays)
try:
    q15 = CodingQuestion.objects.get(pk=15)
    q15.title = "Median of Two Sorted Arrays (LeetCode #4)"
    q15.description = "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays."
    q15.examples = [{"input": "[1, 3]\n[2]", "output": "2.0", "explanation": "merged array = [1,2,3] and median is 2.0."}]
    q15.save()
    q15.test_cases.all().delete()
    CodingTestCase.objects.create(question=q15, input_data="[1, 3]\n[2]", expected_output="2.0", is_hidden=False)
    CodingTestCase.objects.create(question=q15, input_data="[1, 2]\n[3, 4]", expected_output="2.5", is_hidden=True)
    print("[OK] Updated Q15 (Median of Two Sorted Arrays) test cases!")
except CodingQuestion.DoesNotExist:
    pass

print("=" * 60)
print("TEST CASE REPAIR COMPLETED SUCCESSFULLY!")
print("=" * 60)
