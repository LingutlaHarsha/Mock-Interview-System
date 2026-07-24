import sys
import os
import django

backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
sys.path.insert(0, backend_path)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from coding.judge0_service import Judge0Service

tests = [
    ("python", "Python 3", "print('Hello World Python')", "Hello World Python"),
    ("javascript", "JavaScript (Node.js)", "console.log('Hello World JS');", "Hello World JS"),
    ("java", "Java", "public class Main { public static void main(String[] args) { System.out.println(\"Hello World Java\"); } }", "Hello World Java"),
    ("cpp", "C++", "#include <iostream>\nusing namespace std;\nint main() { cout << \"Hello World CPP\" << endl; return 0; }", "Hello World CPP"),
    ("c", "C", "#include <stdio.h>\nint main() { printf(\"Hello World C\\n\"); return 0; }", "Hello World C")
]

print("=" * 60)
print("AUDIT & VERIFICATION REPORT: ALL 5 PROGRAMMING LANGUAGES")
print("=" * 60)

all_passed = True
for lang, name, code, expected in tests:
    res = Judge0Service.execute_code(lang, code, "", expected)
    print(f"[{name} ({lang})] Passed: {res['passed']} | Status: {res['status']} | Output: {repr(res['actual_output'])}")
    if not res['passed']:
        all_passed = False

print("=" * 60)
if all_passed:
    print("SUCCESS: ALL 5 LANGUAGES PASSED COMPILATION & EXECUTION TESTS!")
else:
    print("WARNING: SOME LANGUAGES FAILED COMPILATION")
print("=" * 60)
