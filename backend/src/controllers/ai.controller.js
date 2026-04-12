import Groq from 'groq-sdk';
import { sendSuccess, sendError } from '../utils/response.js';

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  return new Groq({ apiKey });
};

const getGroqModel = () => process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile';

const extractMessageContent = (completion) =>
  completion?.choices?.[0]?.message?.content?.trim() || '';

const stripJsonCodeFence = (value = '') =>
  value.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

const buildFallbackMentorAnswer = (message) => {
  const prompt = message.trim();

  return [
    `Groq is temporarily unavailable, so this is a local fallback response for: "${prompt}".`,
    'Break the problem into small steps, write the simplest working version first, then test edge cases before optimizing.',
    'If you want a stronger answer, retry in a minute after checking your Groq API key and quota.',
  ].join('\n\n');
};

const normalizeRoadmapNode = (node, fallbackTitle = 'Learning Step') => {
  if (typeof node === 'string') {
    return {
      title: node.trim() || fallbackTitle,
      duration: '',
      focus: '',
      children: [],
    };
  }

  if (!node || typeof node !== 'object') {
    return {
      title: fallbackTitle,
      duration: '',
      focus: '',
      children: [],
    };
  }

  return {
    title: String(node.title || node.name || fallbackTitle).trim(),
    duration: String(node.duration || node.time || '').trim(),
    focus: String(node.focus || node.description || node.goal || '').trim(),
    children: Array.isArray(node.children)
      ? node.children.map((child, index) =>
          normalizeRoadmapNode(child, `Step ${index + 1}`)
        )
      : [],
  };
};

const normalizeRoadmapTask = (task, index) => {
  if (typeof task === 'string') {
    return {
      name: task.trim() || `Task ${index + 1}`,
      isCompleted: false,
    };
  }

  return {
    name: String(task?.name || task?.title || `Task ${index + 1}`).trim(),
    isCompleted: Boolean(task?.isCompleted),
  };
};

const normalizeRoadmapModule = (module, index) => {
  const fallbackStatus = index === 0 ? 'in-progress' : 'locked';
  const allowedStatuses = new Set(['completed', 'in-progress', 'locked']);
  const rawStatus = String(module?.status || fallbackStatus).trim().toLowerCase();

  return {
    id: module?.id || index + 1,
    title: String(module?.title || `Module ${index + 1}`).trim(),
    desc: String(module?.desc || module?.description || 'Build this stage step by step.').trim(),
    time: String(module?.time || module?.duration || '2-3 Weeks').trim(),
    status: allowedStatuses.has(rawStatus) ? rawStatus : fallbackStatus,
    tasks: Array.isArray(module?.tasks) && module.tasks.length
      ? module.tasks.map(normalizeRoadmapTask)
      : [{ name: 'Practice the main concepts', isCompleted: false }],
  };
};

const normalizeRoadmapProject = (project, index) => {
  const difficulty = String(project?.difficulty || 'Intermediate').trim();
  const normalizedDifficulty =
    ['Beginner', 'Intermediate', 'Advanced'].find(
      (level) => level.toLowerCase() === difficulty.toLowerCase()
    ) || 'Intermediate';

  return {
    title: String(project?.title || `Project ${index + 1}`).trim(),
    desc: String(project?.desc || project?.description || 'Create a practical project for this stage.').trim(),
    skills: Array.isArray(project?.skills)
      ? project.skills.map((skill) => String(skill).trim()).filter(Boolean)
      : [],
    difficulty: normalizedDifficulty,
  };
};

const buildFallbackRoadmap = (goal, hint = '') => {
  const target = goal.trim();

  return {
    title: `Roadmap for ${target}`,
    duration: '6-8 Months',
    summary:
      hint ||
      `A practical plan to move from fundamentals to interview-ready ${target} skills with consistent projects and revision.`,
    focusAreas: ['Foundations', 'Core Skills', 'Projects', 'Interview Prep'],
    tree: {
      title: `Become a ${target}`,
      duration: '6-8 Months',
      focus: 'Progress from basics to production-level project work.',
      children: [
        {
          title: 'Foundations',
          duration: '3-4 Weeks',
          focus: 'Learn syntax, problem solving, Git, and debugging.',
          children: [
            { title: 'Language Basics', duration: '1 Week', focus: 'Variables, conditions, loops.', children: [] },
            { title: 'Version Control', duration: '1 Week', focus: 'Git, GitHub, branching.', children: [] },
          ],
        },
        {
          title: 'Core Skills',
          duration: '6-8 Weeks',
          focus: 'Master the main technologies required for the goal.',
          children: [
            { title: 'Hands-on Practice', duration: '3 Weeks', focus: 'Build small features every day.', children: [] },
            { title: 'Problem Solving', duration: '2 Weeks', focus: 'Strengthen logic and debugging.', children: [] },
          ],
        },
        {
          title: 'Projects',
          duration: '4-6 Weeks',
          focus: 'Build resume-ready portfolio work.',
          children: [
            { title: 'Mini Project', duration: '2 Weeks', focus: 'Ship one focused project fast.', children: [] },
            { title: 'Capstone Project', duration: '3 Weeks', focus: 'Create a larger production-style app.', children: [] },
          ],
        },
        {
          title: 'Interview Prep',
          duration: '2-3 Weeks',
          focus: 'Revise, document, and prepare to present your work.',
          children: [
            { title: 'Mock Interviews', duration: '1 Week', focus: 'Practice explanations and tradeoffs.', children: [] },
            { title: 'Portfolio Polish', duration: '1 Week', focus: 'Refine README, deployment, and resume.', children: [] },
          ],
        },
      ],
    },
    modules: [
      {
        id: 1,
        title: 'Foundations',
        desc: 'Build the base required for faster learning later.',
        time: '3-4 Weeks',
        status: 'in-progress',
        tasks: [
          { name: 'Choose your primary language', isCompleted: false },
          { name: 'Practice Git and GitHub daily', isCompleted: false },
        ],
      },
      {
        id: 2,
        title: 'Core Skill Building',
        desc: 'Learn the technologies most relevant to the goal.',
        time: '6-8 Weeks',
        status: 'locked',
        tasks: [
          { name: 'Follow one focused learning track', isCompleted: false },
          { name: 'Solve implementation exercises', isCompleted: false },
        ],
      },
      {
        id: 3,
        title: 'Project Phase',
        desc: 'Convert learning into practical portfolio work.',
        time: '4-6 Weeks',
        status: 'locked',
        tasks: [
          { name: 'Build a mini project', isCompleted: false },
          { name: 'Build one capstone project', isCompleted: false },
        ],
      },
    ],
    projects: [
      {
        title: `${target} Starter Project`,
        desc: 'A small project to prove the basic workflow and tooling.',
        skills: ['Planning', 'Implementation', 'Debugging'],
        difficulty: 'Beginner',
      },
      {
        title: `${target} Capstone`,
        desc: 'A deeper project that shows architecture, polish, and deployment.',
        skills: ['Architecture', 'Testing', 'Deployment'],
        difficulty: 'Intermediate',
      },
    ],
    mistakes: [
      'Trying to learn too many tools at once.',
      'Watching tutorials without building projects.',
      'Skipping revision and interview practice.',
    ],
    tips: [
      'Build while learning, not after learning.',
      'Track weekly progress with one concrete project goal.',
      'Revisit fundamentals when advanced topics feel unclear.',
    ],
    advice: 'Consistency and project work matter more than rushing through many resources.',
  };
};

const normalizeRoadmapPayload = (payload, goal) => {
  const fallback = buildFallbackRoadmap(goal);
  const focusAreas = Array.isArray(payload?.focusAreas)
    ? payload.focusAreas.map((item) => String(item).trim()).filter(Boolean)
    : fallback.focusAreas;

  let tree = payload?.tree;

  if (Array.isArray(tree)) {
    tree = {
      title: fallback.tree.title,
      duration: fallback.tree.duration,
      focus: fallback.tree.focus,
      children: tree,
    };
  }

  const normalizedTree = normalizeRoadmapNode(tree || fallback.tree, fallback.tree.title);

  return {
    title: String(payload?.title || fallback.title).trim(),
    duration: String(payload?.duration || fallback.duration).trim(),
    summary: String(payload?.summary || fallback.summary).trim(),
    focusAreas,
    tree: normalizedTree.children.length ? normalizedTree : fallback.tree,
    modules: Array.isArray(payload?.modules) && payload.modules.length
      ? payload.modules.map(normalizeRoadmapModule)
      : fallback.modules,
    projects: Array.isArray(payload?.projects) && payload.projects.length
      ? payload.projects.map(normalizeRoadmapProject)
      : fallback.projects,
    mistakes: Array.isArray(payload?.mistakes) && payload.mistakes.length
      ? payload.mistakes.map((item) => String(item).trim()).filter(Boolean)
      : fallback.mistakes,
    tips: Array.isArray(payload?.tips) && payload.tips.length
      ? payload.tips.map((item) => String(item).trim()).filter(Boolean)
      : fallback.tips,
    advice: String(payload?.advice || fallback.advice).trim(),
  };
};

const createChatCompletion = async ({ messages, temperature, maxTokens }) => {
  const groq = getGroqClient();

  if (!groq) {
    const error = new Error('Groq API key not configured. Please add GROQ_API_KEY to backend/.env');
    error.status = 500;
    throw error;
  }

  return groq.chat.completions.create({
    model: getGroqModel(),
    messages,
    temperature,
    max_tokens: maxTokens,
  });
};

const handleGroqError = (res, error, next) => {
  console.error('Groq API Error:', error.message || error);
  console.error('Error status:', error.status);
  console.error('Error code:', error.code);

  if (error.status === 401 || error.message?.includes('Unauthorized')) {
    return sendError(res, 'Invalid Groq API key', 401);
  }

  if (error.status === 429 || error.code === 'rate_limit_exceeded' || error.message?.includes('rate limit')) {
    return sendError(res, 'Groq quota or rate limit exceeded. Please try again later.', 429);
  }

  if (error.status === 400) {
    return sendError(res, error.message || 'Groq rejected the request', 400);
  }

  if (error.code === 'ENOTFOUND' || error.cause?.code === 'ENOTFOUND') {
    return sendError(res, 'Unable to reach Groq. Check your network connection and try again.', 502);
  }

  // Log unknown errors for debugging
  console.error('Unknown Groq error:', error);
  return sendError(res, error.message || 'An error occurred with Groq API', 500);
};

export const askAI = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return sendError(res, 'Message is required', 400);
    }

    const completion = await createChatCompletion({
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful programming mentor. Provide clear, concise, and well-structured answers. Format responses like ChatGPT:\n- Start with a direct answer to the question\n- Use ## for main sections and proper formatting\n- Use **bold** for important terms\n- Include code examples in ```code blocks```\n- Use numbered lists (1., 2., 3.) for steps\n- Use bullet points (-) for key points\n- Be friendly but professional\n- Keep responses concise and scannable\n- No emojis unless they enhance clarity\n- Answer only what is asked, avoid fluff',
        },
        {
          role: 'user',
          content: message.trim(),
        },
      ],
      temperature: 0.7,
      maxTokens: 800,
    });

    const answer = extractMessageContent(completion);

    if (!answer) {
      return sendError(res, 'Groq returned an empty response', 502);
    }

    return sendSuccess(res, { answer }, 'AI response generated successfully');
  } catch (error) {
    if (error.status === 429 || error.code === 'rate_limit_exceeded') {
      return sendSuccess(
        res,
        { answer: buildFallbackMentorAnswer(req.body.message || ''), fallback: true },
        'Groq is rate-limited, served fallback mentor response instead'
      );
    }

    return handleGroqError(res, error, next);
  }
};

export const getRecommendations = async (req, res, next) => {
  try {
    const completion = await createChatCompletion({
      messages: [
        {
          role: 'system',
          content:
            'You are a career coach and learning advisor. Provide inspiring learning recommendations. Format responses like ChatGPT:\n- Use ## for main sections\n- Use **bold** for course/skill names\n- Structure clearly with: Next Course, Projects, Skills, Timeline\n- Use bullet points for projects and skills\n- Be motivational but realistic\n- Include time estimates\n- Keep it concise and scannable\n- Professional and friendly tone\n- No excessive formatting - clean and readable',
        },
        {
          role: 'user',
          content:
            'Generate a learning path recommendation for a developer.',
        },
      ],
      temperature: 0.7,
      maxTokens: 600,
    });

    const recommendationsText = extractMessageContent(completion);

    if (!recommendationsText) {
      return sendError(res, 'Groq returned an empty response', 502);
    }

    return sendSuccess(res, { recommendations: recommendationsText }, 'Recommendations generated successfully');
  } catch (error) {
    return handleGroqError(res, error, next);
  }
};

export const generateRoadmap = async (req, res, next) => {
  try {
    const { goal } = req.body;

    if (!goal || !goal.trim()) {
      return sendError(res, 'Career goal is required', 400);
    }

    const completion = await createChatCompletion({
      messages: [
        {
          role: 'system',
          content:
            'You generate personalized software learning roadmaps for students. Return strict JSON only with these keys: title, duration, summary, focusAreas, tree, modules, projects, mistakes, tips, advice. The tree key must be an object with keys title, duration, focus, children. Every child must follow the same node shape. Keep the roadmap practical, student-friendly, and concise. Use 4 to 6 top-level tree branches and 2 to 4 child nodes per branch. Modules must include id, title, desc, time, status, and tasks. Projects must include title, desc, skills, and difficulty. No markdown. No explanation outside JSON.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            goal: goal.trim(),
            audience: 'college student or entry-level learner',
            outputStyle: 'tree-structured roadmap with practical modules and projects',
          }),
        },
      ],
      temperature: 0.4,
      maxTokens: 1600,
    });

    const content = extractMessageContent(completion);

    if (!content) {
      return sendError(res, 'Groq returned an empty roadmap response', 502);
    }

    let roadmap;

    try {
      roadmap = normalizeRoadmapPayload(JSON.parse(stripJsonCodeFence(content)), goal);
    } catch (error) {
      roadmap = buildFallbackRoadmap(goal, content);
    }

    return sendSuccess(res, { roadmap }, 'Roadmap generated successfully');
  } catch (error) {
    return handleGroqError(res, error, next);
  }
};

export const reviewCode = async (req, res, next) => {
  try {
    const { code, language } = req.body;

    if (!code || !code.trim()) {
      return sendError(res, 'Code is required', 400);
    }

    const completion = await createChatCompletion({
      messages: [
        {
          role: 'system',
          content:
            'You are an expert code reviewer. Provide constructive, professional feedback. Format responses like ChatGPT:\n- Use ## for main sections\n- Use **bold** for key issues\n- Include ```code examples``` for improvements\n- Use numbered lists for issues found\n- Use bullet points for recommendations\n- Be specific and actionable\n- Explain WHY changes matter\n- Be professional and encouraging\n- Keep it concise and scannable\n- Minimal emojis - only if they enhance clarity',
        },
        {
          role: 'user',
          content: `Review this ${language || 'JavaScript'} code:\n\n${code}\n\nProvide feedback on: 1) Code Quality, 2) Best Practices, 3) Issues to Fix`,
        },
      ],
      temperature: 0.5,
      maxTokens: 800,
    });

    const feedback = extractMessageContent(completion);

    if (!feedback) {
      return sendError(res, 'Groq returned an empty response', 502);
    }

    return sendSuccess(res, { feedback, code, language }, 'Code review completed successfully');
  } catch (error) {
    return handleGroqError(res, error, next);
  }
};

export const askAIStream = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return sendError(res, 'Message is required', 400);
    }

    const groq = getGroqClient();
    if (!groq) {
      return sendError(res, 'Groq API key not configured', 500);
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const stream = await groq.chat.completions.create({
      model: getGroqModel(),
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful programming mentor. Provide clear, concise, and well-structured answers. Format responses like ChatGPT:\n- Start with a direct answer to the question\n- Use ## for main sections and proper formatting\n- Use **bold** for important terms\n- Include code examples in ```code blocks```\n- Use numbered lists (1., 2., 3.) for steps\n- Use bullet points (-) for key points\n- Be friendly but professional\n- Keep responses concise and scannable\n- No emojis unless they enhance clarity\n- Answer only what is asked, avoid fluff',
        },
        {
          role: 'user',
          content: message.trim(),
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Streaming error:', error);
    if (!res.headersSent) {
      return handleGroqError(res, error, next);
    }
    res.end();
  }
};
