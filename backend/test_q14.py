import sys
import os
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
django.setup()

from coding.models import CodingQuestion
from coding.executor import execute_single_test_case

q = CodingQuestion.objects.get(pk=14)
print("TESTING QUESTION:", q.title)

student_code = """class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        last_seen = {}
        left = 0
        max_len = 0
        for right, ch in enumerate(s):
            if ch in last_seen and last_seen[ch] >= left:
                left = last_seen[ch] + 1
            last_seen[ch] = right
            max_len = max(max_len, right - left + 1)
        return max_len
"""

all_passed = True
for tc in q.test_cases.all():
    res = execute_single_test_case('python', student_code, tc.input_data, tc.expected_output)
    print(f"TC #{tc.id} (hidden={tc.is_hidden}) | input={repr(tc.input_data)} | expected={repr(tc.expected_output)} | actual={repr(res['actual_output'])} | passed={res['passed']}")
    if not res['passed']:
        all_passed = False

if all_passed:
    print("\n>>> ALL TEST CASES PASSED SUCCESSFULLY FOR STUDENT CODE! <<<")
