import Groq from 'groq-sdk';
import { sendSuccess, sendError } from '../utils/response.js';

const FINAL_JUDGE0_STATUSES = new Set([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  return new Groq({ apiKey });
};

const getGroqModel = () => process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile';

const stripJsonCodeFence = (value = '') =>
  value.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

const getJudge0BaseUrl = () =>
  (process.env.JUDGE0_API_URL?.trim() || 'https://ce.judge0.com').replace(/\/+$/, '');

const getJudge0Headers = () => {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const baseUrl = getJudge0BaseUrl();
  const apiKey = process.env.JUDGE0_API_KEY?.trim();
  const authToken = process.env.JUDGE0_AUTH_TOKEN?.trim();
  const authHeader = process.env.JUDGE0_AUTH_HEADER?.trim() || 'X-Auth-Token';

  if (baseUrl.includes('rapidapi.com') && apiKey) {
    headers['X-RapidAPI-Key'] = apiKey;
  }

  if (baseUrl.includes('rapidapi.com')) {
    headers['X-RapidAPI-Host'] =
      process.env.JUDGE0_API_HOST?.trim() || 'judge0-ce.p.rapidapi.com';
  } else if (authToken) {
    headers[authHeader] = authToken;
  }

  return headers;
};

const ensureJudge0Config = () => {
  const baseUrl = getJudge0BaseUrl();
  const apiKey = process.env.JUDGE0_API_KEY?.trim();

  if (baseUrl.includes('rapidapi.com') && !apiKey) {
    throw new Error(
      'Judge0 RapidAPI key not configured. Add JUDGE0_API_KEY to backend/.env or switch JUDGE0_API_URL to a direct Judge0 instance.'
    );
  }
};

const extractJudge0Message = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      const data = await response.json();

      if (typeof data === 'string' && data.trim()) {
        return data.trim();
      }

      if (Array.isArray(data) && data.length) {
        return data.join(', ');
      }

      if (Array.isArray(data?.error) && data.error.length) {
        return data.error.join(', ');
      }

      return (
        data?.message ||
        data?.error ||
        data?.detail ||
        data?.stderr ||
        data?.compile_output ||
        ''
      );
    }

    return (await response.text()).trim();
  } catch {
    return '';
  }
};

const buildJudge0RequestError = async (response, actionLabel) => {
  const baseUrl = getJudge0BaseUrl();
  const details = await extractJudge0Message(response);

  if ([401, 403].includes(response.status) && !baseUrl.includes('rapidapi.com')) {
    return 'Judge0 authentication failed. If your Judge0 instance is protected, set JUDGE0_AUTH_TOKEN in backend/.env';
  }

  if (response.status === 429) {
    return 'Judge0 rate limit reached. Try again shortly or use your own Judge0 instance';
  }

  return details
    ? `Judge0 ${actionLabel} failed with status ${response.status}: ${details}`
    : `Judge0 ${actionLabel} failed with status ${response.status}`;
};

const normalizeLineEndings = (value = '') => value.replace(/\r\n/g, '\n').trim();

const isStructuredValue = (value = '') =>
  /^[\[{"]/.test(value) || /^(true|false|null|-?\d)/i.test(value);

const splitExpectedOptions = (raw = '') =>
  raw
    .split(/\s+or\s+/i)
    .map((part) => normalizeLineEndings(part))
    .filter(Boolean);

const expandExpectedOptions = (rawExpected = '') => {
  const directOptions = splitExpectedOptions(rawExpected);

  return directOptions.flatMap((option) => {
    const variants = [option];

    if (
      (option.startsWith('"') && option.endsWith('"')) ||
      (option.startsWith("'") && option.endsWith("'"))
    ) {
      variants.push(option.slice(1, -1));
    }

    return variants;
  });
};

const outputsMatch = (actual = '', expected = '') => {
  const normalizedActual = normalizeLineEndings(actual);
  const expectedOptions = expandExpectedOptions(expected);

  return expectedOptions.some((option) => {
    if (normalizedActual === option) {
      return true;
    }

    if (isStructuredValue(option)) {
      return normalizedActual.replace(/\s+/g, '') === option.replace(/\s+/g, '');
    }

    return false;
  });
};

const summarizeJudge0Error = (submission) =>
  normalizeLineEndings(
    submission.compile_output ||
      submission.stderr ||
      submission.message ||
      submission.status?.description ||
      'Execution failed'
  );

const getSubmissionMetrics = (submissions = []) => {
  const timedRuns = submissions
    .map((submission) => Number.parseFloat(submission.time))
    .filter((value) => Number.isFinite(value));

  const memoryRuns = submissions
    .map((submission) => Number.parseInt(submission.memory, 10))
    .filter((value) => Number.isFinite(value));

  return {
    averageTime: timedRuns.length
      ? `${(timedRuns.reduce((sum, value) => sum + value, 0) / timedRuns.length).toFixed(3)}s`
      : 'N/A',
    bestTime: timedRuns.length ? `${Math.min(...timedRuns).toFixed(3)}s` : 'N/A',
    maxMemory: memoryRuns.length ? `${Math.max(...memoryRuns)} KB` : 'N/A',
  };
};

const submitToJudge0 = async ({ sourceCode, languageId, stdin }) => {
  ensureJudge0Config();

  const response = await fetch(`${getJudge0BaseUrl()}/submissions?base64_encoded=false&wait=false`, {
    method: 'POST',
    headers: getJudge0Headers(),
    body: JSON.stringify({
      source_code: sourceCode,
      language_id: languageId,
      stdin: stdin || '',
    }),
  });

  if (!response.ok) {
    throw new Error(await buildJudge0RequestError(response, 'submission'));
  }

  const data = await response.json();
  return data.token;
};

const getJudge0Submission = async (token) => {
  const response = await fetch(
    `${getJudge0BaseUrl()}/submissions/${token}?base64_encoded=false&fields=*`,
    {
      method: 'GET',
      headers: getJudge0Headers(),
    }
  );

  if (!response.ok) {
    throw new Error(await buildJudge0RequestError(response, 'result fetch'));
  }

  return response.json();
};

const waitForJudge0Result = async (token, maxAttempts = 25) => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const submission = await getJudge0Submission(token);

    if (FINAL_JUDGE0_STATUSES.has(submission.status?.id)) {
      return submission;
    }

    await sleep(1000);
  }

  throw new Error('Judge0 execution timed out');
};

const runExamples = async ({ code, languageId, examples }) => {
  const submissions = [];
  const results = [];

  for (let index = 0; index < examples.length; index += 1) {
    const example = examples[index];
    const token = await submitToJudge0({
      sourceCode: code,
      languageId,
      stdin: example.input,
    });

    const submission = await waitForJudge0Result(token);
    submissions.push(submission);

    const actualOutput = normalizeLineEndings(submission.stdout || '');
    const errorOutput =
      submission.status?.id === 3 ? '' : summarizeJudge0Error(submission);

    results.push({
      id: index,
      name: `Sample Test ${index + 1}`,
      input: example.input,
      expected: example.output,
      actual: actualOutput,
      status: submission.status?.description || 'Unknown',
      passed:
        submission.status?.id === 3 && outputsMatch(actualOutput, example.output),
      time: submission.time ? `${submission.time}s` : 'N/A',
      memory: submission.memory ? `${submission.memory} KB` : 'N/A',
      error: errorOutput || null,
    });
  }

  return {
    results,
    submissions,
  };
};

const analyzeWithGroq = async ({ code, language, problem, executionSummary }) => {
  const groq = getGroqClient();

  if (!groq) {
    return null;
  }

  try {
    const completion = await groq.chat.completions.create({
      model: getGroqModel(),
      temperature: 0.2,
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content:
            'You analyze coding solutions. Return strict JSON with keys: timeComplexity, spaceComplexity, improvementNeeded, hint, improvedApproach. Keep hint and improvedApproach concise.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            problemTitle: problem.title,
            problemDescription: problem.description,
            constraints: problem.constraints,
            sampleOutputs: problem.examples?.map((example) => example.output),
            language,
            executionSummary,
            code,
          }),
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content?.trim() || '';
    if (!content) {
      return null;
    }

    try {
      return JSON.parse(stripJsonCodeFence(content));
    } catch (parseError) {
      return {
        timeComplexity: 'Not available',
        spaceComplexity: 'Not available',
        improvementNeeded: true,
        hint: content,
        improvedApproach: '',
      };
    }
  } catch (error) {
    console.error('Groq practice analysis failed:', error.message || error);
    return {
      timeComplexity: 'Not available',
      spaceComplexity: 'Not available',
      improvementNeeded: false,
      hint: 'Hint is temporarily unavailable. Judge0 execution results are still accurate.',
      improvedApproach: '',
    };
  }
};

export const executePracticeCode = async (req, res, next) => {
  try {
    const { code, language, languageId, problem } = req.body;

    if (!code || !code.trim()) {
      return sendError(res, 'Code is required', 400);
    }

    if (!language || !languageId || !problem?.title || !Array.isArray(problem.examples)) {
      return sendError(res, 'Language and problem details are required', 400);
    }

    if (!problem.examples.length) {
      return sendError(res, 'At least one sample test is required', 400);
    }

    const { results, submissions } = await runExamples({
      code,
      languageId,
      examples: problem.examples,
    });

    const passedCount = results.filter((result) => result.passed).length;
    const hasCompilationError = submissions.some((submission) => submission.status?.id === 6);
    const hasRuntimeError = submissions.some((submission) =>
      [7, 8, 9, 10, 11, 12, 13, 14].includes(submission.status?.id)
    );

    const summary = {
      passedCount,
      totalCount: results.length,
      passedAllTests: passedCount === results.length,
      executionState: hasCompilationError
        ? 'compilation_error'
        : hasRuntimeError
          ? 'runtime_error'
          : passedCount === results.length
            ? 'accepted'
            : 'wrong_answer',
      ...getSubmissionMetrics(submissions),
    };

    const analysis =
      hasCompilationError
        ? null
        : await analyzeWithGroq({
            code,
            language,
            problem,
            executionSummary: summary,
          });

    return sendSuccess(res, { summary, results, analysis }, 'Code executed successfully');
  } catch (error) {
    if (error.message?.includes('Judge0')) {
      return sendError(res, error.message, 502);
    }

    next(error);
  }
};
