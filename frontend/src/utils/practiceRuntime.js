export const LANGUAGES = {
  javascript: { id: "javascript", name: "JavaScript", icon: "🟨", judge0Id: 63 },
  python: { id: "python", name: "Python", icon: "🐍", judge0Id: 71 },
  java: { id: "java", name: "Java", icon: "☕", judge0Id: 62 },
  cpp: { id: "cpp", name: "C++", icon: "⚙️", judge0Id: 54 },
};

const getSampleInput = (problem) => problem?.examples?.[0]?.input || "";
const getSampleOutput = (problem) => problem?.examples?.[0]?.output || "";

const getHeaderComment = (problem) => {
  const title = problem?.title || "Practice Problem";
  const input = getSampleInput(problem);
  const output = getSampleOutput(problem);

  return {
    title,
    input,
    output,
  };
};

const createJavaScriptTemplate = (problem) => {
  const { title, input, output } = getHeaderComment(problem);

  return `/**
 * ${title}
 * Sample input: ${input}
 * Sample output: ${output}
 *
 * Write your logic inside solve(input).
 * Return the final answer exactly as it should be printed.
 */
function solve(input) {
  return "";
}

const fs = require("fs");
const input = fs.readFileSync(0, "utf8").trim();
const result = solve(input);

if (typeof result !== "undefined" && result !== null) {
  if (typeof result === "string") {
    console.log(result);
  } else {
    console.log(JSON.stringify(result));
  }
}
`;
};

const createPythonTemplate = (problem) => {
  const { title, input, output } = getHeaderComment(problem);

  return `"""
${title}
Sample input: ${input}
Sample output: ${output}

Write your logic inside solve(input_data).
Return the final answer exactly as it should be printed.
"""

def solve(input_data):
    return ""


if __name__ == "__main__":
    import json
    import sys

    input_data = sys.stdin.read().strip()
    result = solve(input_data)

    if result is not None:
        if isinstance(result, (dict, list, tuple, bool, int, float)):
            print(json.dumps(result))
        else:
            print(result)
`;
};

const createJavaTemplate = (problem) => {
  const { title, input, output } = getHeaderComment(problem);

  return `import java.io.BufferedReader;
import java.io.InputStreamReader;

public class Main {
    /*
     * ${title}
     * Sample input: ${input}
     * Sample output: ${output}
     *
     * Write your logic inside solve(input).
     * Return the final answer exactly as it should be printed.
     */
    static String solve(String input) {
        return "";
    }

    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder input = new StringBuilder();
        String line;
        boolean firstLine = true;

        while ((line = reader.readLine()) != null) {
            if (!firstLine) {
                input.append("\\n");
            }
            input.append(line);
            firstLine = false;
        }

        String result = solve(input.toString().trim());
        if (result != null) {
            System.out.print(result);
        }
    }
}
`;
};

const createCppTemplate = (problem) => {
  const { title, input, output } = getHeaderComment(problem);

  return `#include <bits/stdc++.h>
using namespace std;

/*
 * ${title}
 * Sample input: ${input}
 * Sample output: ${output}
 *
 * Write your logic inside solve(input).
 * Return the final answer exactly as it should be printed.
 */
string solve(const string& input) {
    return "";
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string input((istreambuf_iterator<char>(cin)), istreambuf_iterator<char>());
    string result = solve(input);

    cout << result;

    return 0;
}
`;
};

export const getCodeTemplate = (language, problem) => {
  switch (language) {
    case "javascript":
      return createJavaScriptTemplate(problem);
    case "python":
      return createPythonTemplate(problem);
    case "java":
      return createJavaTemplate(problem);
    case "cpp":
      return createCppTemplate(problem);
    default:
      return createJavaScriptTemplate(problem);
  }
};

export const validateCode = (code, language) => {
  const trimmedCode = code.trim();

  if (!trimmedCode) {
    return ["Code cannot be empty."];
  }

  const requiredMarkers = {
    javascript: "function solve",
    python: "def solve",
    java: "class Main",
    cpp: "string solve",
  };

  const marker = requiredMarkers[language];

  if (marker && !trimmedCode.includes(marker)) {
    return [`${LANGUAGES[language]?.name || "Selected language"} code must include "${marker}".`];
  }

  return [];
};
