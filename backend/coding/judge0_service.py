import os
import json
import time
import urllib.request
import urllib.parse
from django.conf import settings

from .language_config import get_language_config, LANGUAGE_CONFIG

# Environment variable or fallback
JUDGE0_API_URL = os.environ.get("JUDGE0_API_URL", "http://localhost:2358")
JUDGE0_RAPIDAPI_HOST = os.environ.get("JUDGE0_RAPIDAPI_HOST", "")
JUDGE0_RAPIDAPI_KEY = os.environ.get("JUDGE0_RAPIDAPI_KEY", "")


class Judge0Service:
    """
    Decoupled Code Execution Service Layer for Judge0 CE Engine.
    Handles submission creation, status polling, output parsing,
    and fallback sandbox execution using central language configuration.
    """

    @staticmethod
    def get_language_id(language_str):
        cfg = get_language_config(language_str)
        return cfg.get("judge0_id", 71)

    @classmethod
    def execute_code(cls, language, source_code, stdin_data="", expected_output=""):
        """
        Submits code to Judge0 CE API and returns structured execution metrics.
        """
        lang_id = cls.get_language_id(language)
        payload = {
            "source_code": source_code,
            "language_id": lang_id,
            "stdin": stdin_data or "",
            "expected_output": expected_output or ""
        }

        # Try executing via Judge0 API endpoint first
        result = cls._call_judge0_api(payload)
        if result:
            return result

        # Fallback to local isolated sandbox execution if Judge0 server is unavailable
        return cls._fallback_local_execution(language, source_code, stdin_data, expected_output)

    @classmethod
    def _call_judge0_api(cls, payload):
        try:
            url = f"{JUDGE0_API_URL.rstrip('/')}/submissions?wait=true"
            data_bytes = json.dumps(payload).encode('utf-8')

            headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'Antigravity-Online-Judge/2.0'
            }
            if JUDGE0_RAPIDAPI_KEY:
                headers['X-RapidAPI-Key'] = JUDGE0_RAPIDAPI_KEY
                headers['X-RapidAPI-Host'] = JUDGE0_RAPIDAPI_HOST

            req = urllib.request.Request(url, data=data_bytes, headers=headers)
            res = urllib.request.urlopen(req, timeout=5)
            if res.status in (200, 201):
                body = json.loads(res.read().decode('utf-8'))
                return cls._parse_judge0_response(body, payload.get('expected_output', ''))
        except Exception as e:
            # Judge0 API not reachable directly on configured port, proceed to fallback
            pass
        return None

    @classmethod
    def _parse_judge0_response(cls, body, expected_output=""):
        stdout = (body.get('stdout') or '').strip()
        stderr = (body.get('stderr') or '').strip()
        compile_out = (body.get('compile_output') or '').strip()
        status_info = body.get('status', {})
        status_id = status_info.get('id', 3)
        status_desc = status_info.get('description', 'Accepted')

        time_sec = float(body.get('time') or 0.0)
        time_ms = round(time_sec * 1000.0, 2)
        memory_kb = float(body.get('memory') or 0.0)

        # Output strip comparison (Req: Always compare actual.strip() vs expected.strip())
        expected_clean = expected_output.strip()
        actual_clean = stdout.strip()

        passed = (status_id == 3) and (actual_clean == expected_clean if expected_clean else True)
        error_msg = compile_out or stderr or (status_desc if status_id not in (3, 4) else "")

        return {
            "passed": passed,
            "status": status_desc,
            "status_id": status_id,
            "actual_output": stdout,
            "expected_output": expected_clean,
            "stdout": stdout,
            "stderr": stderr,
            "compile_output": compile_out,
            "error_message": error_msg,
            "execution_time_ms": time_ms if time_ms > 0 else 15.0,
            "memory_kb": memory_kb if memory_kb > 0 else 256.0
        }

    @classmethod
    def _fallback_local_execution(cls, language, source_code, stdin_data, expected_output):
        """
        Isolated fallback execution harness when Judge0 CE service is offline.
        Imports the robust executor harness.
        """
        from .executor import execute_single_test_case
        res = execute_single_test_case(language, source_code, stdin_data, expected_output)
        if 'status' not in res:
            res['status'] = 'Accepted' if res.get('passed') else ('Compilation Error' if 'Compilation' in res.get('error_message', '') else 'Wrong Answer')
            res['status_id'] = 3 if res.get('passed') else (6 if 'Compilation' in res.get('error_message', '') else 4)
            res['stdout'] = res.get('actual_output', '')
            res['stderr'] = res.get('error_message', '')
            res['compile_output'] = res.get('error_message', '') if 'Compilation' in res.get('error_message', '') else ''
        return res
