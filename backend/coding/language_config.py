"""
CENTRALIZED MULTI-LANGUAGE CONFIGURATION MATRIX
Supports: Python, Java, C, C++, JavaScript
"""

import json

LANGUAGE_CONFIG = {
    "python": {
        "name": "Python 3",
        "judge0_id": 71,
        "extension": ".py",
        "compiler": "python",
        "boilerplate": """class Solution:
    def solve(self, input_data):
        return input_data
""",
        "wrap_leetcode": lambda code: code + """

# --- AUTOMATED PYTHON HARNESS ---
if __name__ == '__main__':
    import sys, ast, inspect, json

    def parse_single_arg(val_str):
        val_str = val_str.strip()
        if not val_str: return val_str
        if val_str.lower() == 'true': return True
        if val_str.lower() == 'false': return False
        try: return json.loads(val_str)
        except Exception: pass
        try: return ast.literal_eval(val_str)
        except Exception: pass
        tokens = val_str.split()
        if len(tokens) > 1:
            num_list = []
            is_num = True
            for t in tokens:
                try: num_list.append(float(t) if '.' in t else int(t))
                except ValueError: is_num = False; break
            if is_num: return num_list
        try: return float(val_str) if '.' in val_str else int(val_str)
        except ValueError: pass
        return val_str

    raw_input = sys.stdin.read().strip()
    args = [parse_single_arg(l) for l in raw_input.splitlines() if l.strip()] if raw_input else []
    parsed_full = parse_single_arg(raw_input)

    def print_result(res):
        if res is None: return
        if isinstance(res, bool): print(str(res).lower())
        elif isinstance(res, (list, tuple, set, dict)):
            res_list = list(res)
            if len(res_list) > 0 and isinstance(res_list[0], (list, tuple, set, dict)):
                for item in res_list:
                    if isinstance(item, (list, tuple, set)): print(" ".join(str(x) for x in item))
                    else: print(json.dumps(item))
            else: print(" ".join(str(x) for x in res_list))
        else: print(res)

    if 'Solution' in globals() and inspect.isclass(globals()['Solution']):
        sol = globals()['Solution']()
        methods = [m for m in dir(sol) if not m.startswith('__') and callable(getattr(sol, m))]
        if methods:
            target = getattr(sol, methods[0])
            res = None
            try: res = target(*args)
            except Exception:
                try: res = target(parsed_full)
                except Exception:
                    try: res = target(args[0])
                    except Exception: pass
            print_result(res)
    else:
        custom_funcs = [v for k, v in list(globals().items()) if inspect.isfunction(v) and not k.startswith('_') and v.__module__ == '__main__']
        if custom_funcs:
            target = custom_funcs[0]
            res = None
            try: res = target(*args)
            except Exception:
                try: res = target(parsed_full)
                except Exception:
                    try: res = target(args[0])
                    except Exception: pass
            print_result(res)
"""
    },

    "javascript": {
        "name": "JavaScript (Node.js)",
        "judge0_id": 63,
        "extension": ".js",
        "compiler": "node",
        "boilerplate": """// Write your JavaScript solution below
function solve(inputData) {
    return inputData;
}
""",
        "wrap_leetcode": lambda code: code + """

// --- AUTOMATED JS HARNESS ---
try {
    const fs = require('fs');
    const rawInput = fs.readFileSync(0, 'utf-8').trim();
    if (typeof Solution !== 'undefined') {
        const sol = new Solution();
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(sol)).filter(m => m !== 'constructor');
        if (methods.length > 0) {
            let parsed = rawInput;
            try { parsed = JSON.parse(rawInput); } catch(e) {}
            const res = sol[methods[0]](parsed);
            if (res !== undefined) {
                console.log(typeof res === 'object' ? JSON.stringify(res) : res);
            }
        }
    } else if (typeof solve === 'function') {
        const res = solve(rawInput);
        if (res !== undefined) console.log(res);
    }
} catch (e) {
    console.error(e);
}
"""
    },

    "java": {
        "name": "Java (OpenJDK)",
        "judge0_id": 62,
        "extension": ".java",
        "compiler": "javac",
        "boilerplate": """import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            System.out.println(sc.nextLine());
        }
    }
}
""",
        "wrap_leetcode": lambda code: (code if "class Main" in code or "public static void main" in code else code + """

class Main {
    public static void main(String[] args) {
        try {
            java.util.Scanner sc = new java.util.Scanner(System.in);
            if (sc.hasNextLine()) {
                String input = sc.nextLine().trim();
                System.out.println(input);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
""")
    },

    "cpp": {
        "name": "C++ (GCC)",
        "judge0_id": 54,
        "extension": ".cpp",
        "compiler": "g++",
        "boilerplate": """#include <iostream>
using namespace std;

int main() {
    string s;
    if (cin >> s) {
        cout << s << endl;
    }
    return 0;
}
""",
        "wrap_leetcode": lambda code: (code if "int main(" in code else code + """

#include <iostream>
#include <string>
using namespace std;

int main() {
    string input;
    if (cin >> input) {
        cout << input << endl;
    }
    return 0;
}
""")
    },

    "c": {
        "name": "C (GCC)",
        "judge0_id": 50,
        "extension": ".c",
        "compiler": "gcc",
        "boilerplate": """#include <stdio.h>

int main() {
    char str[100];
    if (scanf("%s", str) == 1) {
        printf("%s\\n", str);
    }
    return 0;
}
""",
        "wrap_leetcode": lambda code: (code if "int main(" in code else code + """

#include <stdio.h>

int main() {
    char str[100];
    if (scanf("%s", str) == 1) {
        printf("%s\\n", str);
    }
    return 0;
}
""")
    }
}


def get_language_config(language_str):
    lang = str(language_str).strip().lower()
    if lang in ['python', 'py']: return LANGUAGE_CONFIG['python']
    if lang in ['javascript', 'js', 'node']: return LANGUAGE_CONFIG['javascript']
    if lang in ['java']: return LANGUAGE_CONFIG['java']
    if lang in ['cpp', 'c++']: return LANGUAGE_CONFIG['cpp']
    if lang in ['c']: return LANGUAGE_CONFIG['c']
    return LANGUAGE_CONFIG['python']
