import { PROBLEM_SIGNATURES } from "./codeExecutor";

export const LANGUAGES = {
  javascript: { id: "javascript", name: "JavaScript", icon: "🟨", judge0Id: 63 },
  python: { id: "python", name: "Python", icon: "🐍", judge0Id: 71 },
  java: { id: "java", name: "Java", icon: "☕", judge0Id: 62 },
  cpp: { id: "cpp", name: "C++", icon: "⚙️", judge0Id: 54 },
};

const toReadableTitleSignature = (problem) => {
  const fallbackName = String(problem?.title || "solution")
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[A-Z]/, (char) => char.toLowerCase())
    .replace(/[^a-zA-Z0-9]/g, "");

  return {
    fn: fallbackName || "solution",
    params: ["input: string"],
    ret: "string",
  };
};

const getProblemSignature = (problem) =>
  PROBLEM_SIGNATURES[problem?.id] || toReadableTitleSignature(problem);

const splitParam = (param) => {
  const [name, type = "any"] = param.split(": ");
  return { name, type };
};

const pythonName = (name) =>
  name.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");

const pythonType = (type) =>
  type
    .replace(/number\[\]\[\]/g, "List[List[int]]")
    .replace(/string\[\]\[\]/g, "List[List[str]]")
    .replace(/number\[\]/g, "List[int]")
    .replace(/string\[\]/g, "List[str]")
    .replace(/boolean/g, "bool")
    .replace(/number/g, "int")
    .replace(/string/g, "str")
    .replace(/void/g, "None");

const javaType = (type) =>
  type
    .replace(/number\[\]\[\]/g, "int[][]")
    .replace(/string\[\]\[\]/g, "String[][]")
    .replace(/number\[\]/g, "int[]")
    .replace(/string\[\]/g, "String[]")
    .replace(/number/g, "int")
    .replace(/string/g, "String")
    .replace(/boolean/g, "boolean");

const cppType = (type, isParam = false) => {
  const mapped = type
    .replace(/number\[\]\[\]/g, "vector<vector<int>>")
    .replace(/string\[\]\[\]/g, "vector<vector<string>>")
    .replace(/number\[\]/g, "vector<int>")
    .replace(/string\[\]/g, "vector<string>")
    .replace(/number/g, "int")
    .replace(/string/g, "string")
    .replace(/boolean/g, "bool");

  if (isParam && (mapped.startsWith("vector") || mapped === "string")) {
    return `${mapped}&`;
  }

  return mapped;
};

const defaultReturnForJava = (type) => {
  if (type === "void") return "";
  if (type === "boolean") return "\n        return false;";
  if (type === "number") return "\n        return 0;";
  return "\n        return null;";
};

const defaultReturnForCpp = (type) => {
  if (type === "void") return "";
  if (type === "boolean") return "\n        return false;";
  if (type === "number") return "\n        return 0;";
  return "\n        return {};";
};

const createLeetCodeTemplate = (language, problem) => {
  const signature = getProblemSignature(problem);
  const params = signature.params.map(splitParam);

  if (language === "python") {
    const typedParams = params
      .map(({ name, type }) => `${name}: ${pythonType(type)}`)
      .join(", ");
    const returnType = pythonType(signature.ret);

    return `class Solution:
    def ${pythonName(signature.fn)}(self${typedParams ? `, ${typedParams}` : ""}) -> ${returnType}:
        `;
  }

  if (language === "java") {
    const typedParams = params
      .map(({ name, type }) => `${javaType(type)} ${name}`)
      .join(", ");
    const returnType = javaType(signature.ret);

    return `class Solution {
    public ${returnType} ${signature.fn}(${typedParams}) {${defaultReturnForJava(signature.ret)}
    }
}`;
  }

  if (language === "cpp") {
    const typedParams = params
      .map(({ name, type }) => `${cppType(type, true)} ${name}`)
      .join(", ");
    const returnType = cppType(signature.ret);

    return `class Solution {
public:
    ${returnType} ${signature.fn}(${typedParams}) {${defaultReturnForCpp(signature.ret)}
    }
};`;
  }

  const jsParams = params.map(({ name }) => name).join(", ");
  return `var ${signature.fn} = function(${jsParams}) {
    
};`;
};

export const getCodeTemplate = (language, problem) => {
  return createLeetCodeTemplate(language, problem);
};

export const validateCode = (code, language) => {
  const trimmedCode = code.trim();

  if (!trimmedCode) {
    return ["Code cannot be empty."];
  }

  return [];
};
