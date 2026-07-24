import sys
import os
import django

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from coding.judge0_service import Judge0Service

LANGUAGES_TEST = [
    {
        "lang": "python",
        "name": "Python 3",
        "code": "print('Hello World Python')",
        "stdin": "",
        "expected": "Hello World Python"
    },
    {
        "lang": "javascript",
        "name": "JavaScript (Node.js)",
        "code": "console.log('Hello World JS');",
        "stdin": "",
        "expected": "Hello World JS"
    },
    {
        "lang": "java",
        "name": "Java",
        "code": "public class Main { public static void main(String[] args) { System.out.println(\"Hello World Java\"); } }",
        "stdin": "",
        "expected": "Hello World Java"
    },
    {
        "lang": "cpp",
        "name": "C++",
        "code": "#include <iostream>\nusing namespace std;\nint main() { cout << \"Hello World CPP\" << endl; return 0; }",
        "stdin": "",
        "expected": "Hello World CPP"
    },
    {
        "lang": "c",
        "name": "C",
        "code": "#include <stdio.h>\nint main() { printf(\"Hello World C\\n\"); return 0; }",
        "stdin": "",
        "expected": "Hello World C"
    }
]

def run_tests():
    print("=" * 60)
    print("RUNNING MULTI-LANGUAGE COMPILER AUDIT & TEST SUITE")
    print("=" * 60)

    all_passed = True
    for item in LANGUAGES_TEST:
        lang = item["lang"]
        name = item["name"]
        code = item["code"]
        expected = item["expected"]

        print(f"\nTesting Language: {name} ({lang})")
        res = Judge0Service.execute_code(lang, code, item["stdin"], expected)
        print(f"Passed: {res['passed']}")
        print(f"Status: {res['status']}")
        print(f"Actual Output: {res['actual_output']}")
        if res.get('error_message'):
            print(f"Error Log: {res['error_message']}")

        if not res['passed']:
            all_passed = False

    print("\n" + "=" * 60)
    if all_passed:
        print("✅ SUCCESS: ALL 5 LANGUAGES PASSED COMPILATION & EXECUTION TESTS!")
    else:
        print("⚠️ SOME LANGUAGES FAILED - CHECK SYSTEM COMPILER ENVIRONMENT")
    print("=" * 60)

if __name__ == '__main__':
    run_tests()
