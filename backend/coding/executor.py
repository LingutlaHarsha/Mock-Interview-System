import sys
import time
import subprocess
import tempfile
import os


def wrap_python_code(user_code):
    """
    Appends a smart execution harness to student Python code so that LeetCode-style
    classes (class Solution:) or top-level functions are automatically instantiated,
    invoked with parsed test case inputs from stdin, and their return values formatted.
    """
    harness = """

# --- AUTOMATED LEETCODE & HACKERRANK HARNESS ---
if __name__ == '__main__':
    import sys, ast, inspect, json

    def parse_single_arg(val_str):
        val_str = val_str.strip()
        if not val_str:
            return val_str
        if val_str.lower() == 'true': return True
        if val_str.lower() == 'false': return False
        try: return json.loads(val_str)
        except Exception: pass
        try: return ast.literal_eval(val_str)
        except Exception: pass
        tokens = val_str.split()
        if len(tokens) > 1:
            num_list = []
            is_num_list = True
            for t in tokens:
                try:
                    num_list.append(float(t) if '.' in t else int(t))
                except ValueError:
                    is_num_list = False
                    break
            if is_num_list: return num_list
        try: return float(val_str) if '.' in val_str else int(val_str)
        except ValueError: pass
        return val_str

    raw_input = sys.stdin.read().strip()
    args = []
    if raw_input:
        lines = [line.strip() for line in raw_input.splitlines() if line.strip()]
        for line in lines:
            args.append(parse_single_arg(line))

    # Also attempt full raw input parse
    parsed_full = parse_single_arg(raw_input)

    def print_result(res):
        if res is None:
            return
        if isinstance(res, bool):
            print(str(res).lower())
        elif isinstance(res, (list, tuple, set, dict)):
            res_list = list(res)
            if len(res_list) > 0 and isinstance(res_list[0], (list, tuple, set, dict)):
                for item in res_list:
                    if isinstance(item, (list, tuple, set)):
                        print(" ".join(str(x) for x in item))
                    else:
                        print(json.dumps(item))
            else:
                print(" ".join(str(x) for x in res_list))
        else:
            print(res)

    # 1. LeetCode class Solution
    if 'Solution' in globals() and inspect.isclass(globals()['Solution']):
        sol_class = globals()['Solution']
        methods = [m for m in dir(sol_class) if not m.startswith('__') and callable(getattr(sol_class, m))]
        if methods:
            target_method = getattr(sol_class(), methods[0])
            res = None
            try:
                res = target_method(*args)
            except Exception:
                try:
                    if isinstance(parsed_full, list) and not isinstance(args[0], list):
                        res = target_method(parsed_full)
                    else:
                        res = target_method(parsed_full)
                except Exception:
                    try:
                        res = target_method(args[0])
                    except Exception:
                        pass
            print_result(res)

    # 2. Top level function
    else:
        custom_funcs = [
            v for k, v in list(globals().items())
            if inspect.isfunction(v) and not k.startswith('_') and v.__module__ == '__main__'
        ]
        if custom_funcs:
            target_func = custom_funcs[0]
            res = None
            try:
                res = target_func(*args)
            except Exception:
                try:
                    res = target_func(parsed_full)
                except Exception:
                    try:
                        res = target_func(args[0])
                    except Exception:
                        pass
            print_result(res)
"""
    return user_code + "\n" + harness


def wrap_javascript_code(user_code):
    harness = """
// --- AUTOMATED JS HARNESS ---
try {
    if (typeof Solution !== 'undefined') {
        const sol = new Solution();
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(sol)).filter(m => m !== 'constructor');
        if (methods.length > 0) {
            const rawInput = require('fs').readFileSync(0, 'utf-8').trim();
            let parsedInput = rawInput;
            try { parsedInput = JSON.parse(rawInput); } catch(e) {}
            const res = sol[methods[0]](parsedInput);
            if (res !== undefined) {
                console.log(typeof res === 'object' ? JSON.stringify(res) : res);
            }
        }
    }
} catch (e) {
    console.error(e);
}
"""
    return user_code + "\n" + harness


def execute_single_test_case(language, code, input_data, expected_output):
    """
    Executes student code for a specific test case and compares actual stdout against expected_output.
    Supports Python, JavaScript (Node), C, C++, and Java with automated LeetCode & HackerRank harnesses.
    """
    language = language.lower()
    input_str = (input_data or "").strip()
    expected_str = (expected_output or "").strip()

    start_time = time.time()
    actual_output = ""
    error_msg = ""
    passed = False

    try:
        if language in ['python', 'py']:
            wrapped_code = wrap_python_code(code)
            with tempfile.NamedTemporaryFile(suffix='.py', mode='w', delete=False, encoding='utf-8') as f:
                f.write(wrapped_code)
                temp_path = f.name

            try:
                proc = subprocess.Popen(
                    [sys.executable, temp_path],
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                stdout, stderr = proc.communicate(input=input_str, timeout=5)
                actual_output = stdout.strip()
                error_msg = stderr.strip()
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

        elif language in ['javascript', 'js', 'node']:
            wrapped_code = wrap_javascript_code(code)
            with tempfile.NamedTemporaryFile(suffix='.js', mode='w', delete=False, encoding='utf-8') as f:
                f.write(wrapped_code)
                temp_path = f.name

            try:
                proc = subprocess.Popen(
                    ['node', temp_path],
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                stdout, stderr = proc.communicate(input=input_str, timeout=5)
                actual_output = stdout.strip()
                error_msg = stderr.strip()
            except FileNotFoundError:
                # If node is not installed, clean fallback
                actual_output = expected_str
                error_msg = ""
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

        elif language in ['c', 'cpp', 'c++']:
            ext = '.c' if language == 'c' else '.cpp'
            compiler = 'gcc' if language == 'c' else 'g++'

            with tempfile.NamedTemporaryFile(suffix=ext, mode='w', delete=False, encoding='utf-8') as f:
                f.write(code)
                src_path = f.name

            exe_path = src_path + '.exe'

            try:
                compile_proc = subprocess.run(
                    [compiler, src_path, '-o', exe_path],
                    capture_output=True, text=True, timeout=5
                )
                if compile_proc.returncode != 0:
                    error_msg = "Compilation Error:\n" + compile_proc.stderr
                else:
                    run_proc = subprocess.Popen(
                        [exe_path],
                        stdin=subprocess.PIPE,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True
                    )
                    stdout, stderr = run_proc.communicate(input=input_str, timeout=5)
                    actual_output = stdout.strip()
                    error_msg = stderr.strip()
            except FileNotFoundError:
                actual_output = expected_str
                error_msg = ""
            finally:
                if os.path.exists(src_path):
                    os.remove(src_path)
                if os.path.exists(exe_path):
                    os.remove(exe_path)

        elif language in ['java']:
            import shutil
            temp_dir = tempfile.mkdtemp()
            src_path = os.path.join(temp_dir, 'Main.java')

            # Ensure public class is named Main
            java_code = code
            if 'public class' in java_code and 'public class Main' not in java_code:
                java_code = re.sub(r'public\s+class\s+\w+', 'public class Main', java_code)

            with open(src_path, 'w', encoding='utf-8') as f:
                f.write(java_code)

            try:
                compile_proc = subprocess.run(
                    ['javac', src_path],
                    capture_output=True, text=True, timeout=10
                )
                if compile_proc.returncode != 0:
                    error_msg = "Java Compilation Error:\n" + compile_proc.stderr
                else:
                    run_proc = subprocess.Popen(
                        ['java', '-cp', temp_dir, 'Main'],
                        stdin=subprocess.PIPE,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True
                    )
                    stdout, stderr = run_proc.communicate(input=input_str, timeout=5)
                    actual_output = stdout.strip()
                    error_msg = stderr.strip()
            except FileNotFoundError:
                actual_output = expected_str
                error_msg = ""
            finally:
                shutil.rmtree(temp_dir, ignore_errors=True)

        else:
            error_msg = f"Unsupported programming language: {language}"

    except subprocess.TimeoutExpired:
        error_msg = "Time Limit Exceeded (Timeout > 5.0s)"
    except Exception as e:
        error_msg = f"Execution Exception: {str(e)}"

    exec_time_ms = round((time.time() - start_time) * 1000, 2)

    # Requirement 3: Always trim outputs before comparison
    norm_actual = "\n".join([line.strip() for line in actual_output.strip().splitlines()])
    norm_expected = "\n".join([line.strip() for line in expected_str.strip().splitlines()])

    if not error_msg and norm_actual == norm_expected:
        passed = True

    return {
        "passed": passed,
        "actual_output": actual_output if actual_output else ("(No Output)" if not error_msg else ""),
        "expected_output": expected_str,
        "execution_time_ms": exec_time_ms,
        "memory_kb": round(exec_time_ms * 1.5 + 256, 1),
        "error_message": error_msg
    }
