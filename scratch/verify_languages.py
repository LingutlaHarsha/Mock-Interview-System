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

for lang, name, code, expected in tests:
    res = Judge0Service.execute_code(lang, code, "", expected)
    print(f"[{name} ({lang})] Passed: {res['passed']} | Status: {res['status']} | Output: {repr(res['actual_output'])}")

print("=" * 60)
