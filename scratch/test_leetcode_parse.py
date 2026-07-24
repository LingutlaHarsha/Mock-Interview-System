import urllib.request
import json
import re


def parse_leetcode_url(url_or_title):
    slug = url_or_title.strip()
    if 'leetcode.com/problems/' in slug:
        match = re.search(r'leetcode\.com/problems/([^/]+)', slug)
        if match:
            slug = match.group(1)

    slug = slug.strip().lower().replace(' ', '-')
    print(f"Parsing LeetCode Slug: {slug}")

    gql_url = "https://leetcode.com/graphql"
    query = """
    query getQuestionDetail($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
            title
            difficulty
            content
            exampleTestcaseList
            topicTags {
                name
            }
        }
    }
    """

    payload = {
        "query": query,
        "variables": {"titleSlug": slug}
    }

    req = urllib.request.Request(
        gql_url,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
    )

    try:
        res = urllib.request.urlopen(req, timeout=10)
        data = json.loads(res.read().decode('utf-8'))
        q = data.get('data', {}).get('question')
        if not q:
            print("Question not found on LeetCode API")
            return None

        html = q.get('content', '')

        # Extract Constraints block using regex
        constraints = ""
        c_match = re.search(r'Constraints:\s*</span>\s*<ul>([\s\S]*?)</ul>', html, re.IGNORECASE)
        if not c_match:
            c_match = re.search(r'Constraints:[\s\S]*?<ul>([\s\S]*?)</ul>', html, re.IGNORECASE)
        if c_match:
            lis = re.findall(r'<li>([\s\S]*?)</li>', c_match.group(1))
            cleaned_lis = [re.sub(r'<[^>]+>', '', li).strip() for li in lis]
            constraints = "\n".join(cleaned_lis)

        # Fallback constraints if not found in <ul>
        if not constraints:
            c_match_fallback = re.search(r'Constraints:([\s\S]*?)(?:<p>|</body>|\Z)', html, re.IGNORECASE)
            if c_match_fallback:
                constraints = re.sub(r'<[^>]+>', '', c_match_fallback.group(1)).strip()

        # Clean HTML to plain text for description
        text = re.sub(r'<pre>[\s\S]*?</pre>', '', html)  # remove example pre blocks from description
        text = re.sub(r'<[^>]+>', '', text).strip()
        text = re.sub(r'\n\s*\n', '\n\n', text)

        description = text
        if 'Example 1:' in text:
            description = text.split('Example 1:')[0].strip()
        elif 'Constraints:' in text:
            description = text.split('Constraints:')[0].strip()

        # Parse Examples
        examples = []
        example_blocks = re.findall(r'<pre>([\s\S]*?)</pre>', html)
        for b in example_blocks:
            clean_b = re.sub(r'<[^>]+>', '', b).strip()
            inp = re.search(r'Input:\s*(.*?)(?:\n|Output:|\Z)', clean_b)
            out = re.search(r'Output:\s*(.*?)(?:\n|Explanation:|\Z)', clean_b)
            exp = re.search(r'Explanation:\s*(.*)', clean_b, re.DOTALL)

            if inp and out:
                examples.append({
                    "input": inp.group(1).strip(),
                    "output": out.group(1).strip(),
                    "explanation": exp.group(1).strip() if exp else ""
                })

        tc_list = q.get('exampleTestcaseList', [])
        if not examples and tc_list:
            for tc in tc_list:
                examples.append({"input": tc, "output": "See problem specification", "explanation": ""})

        result = {
            "title": q.get('title'),
            "difficulty": q.get('difficulty'),
            "description": description.strip(),
            "constraints": constraints.strip(),
            "examples": examples,
            "topics": [t.get('name') for t in q.get('topicTags', [])]
        }
        print("PARSE SUCCESS:")
        print(json.dumps(result, indent=2))
        return result

    except Exception as e:
        print("Parse error:", e)
        return None


if __name__ == '__main__':
    parse_leetcode_url("https://leetcode.com/problems/median-of-two-sorted-arrays/description/")
