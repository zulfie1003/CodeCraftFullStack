// controllers/ai.controller.js
import { sendSuccess, sendError } from '../utils/response.js';
import OpenAI from 'openai';

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI Mentor - Chat with OpenAI
export const askAI = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return sendError(res, 'Message is required', 400);
    }

    if (!process.env.OPENAI_API_KEY) {
      return sendError(res, 'OpenAI API key not configured. Please add OPENAI_API_KEY to .env', 500);
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert programming mentor and technical guide. Provide clear, concise, and helpful answers to programming questions. Include code examples when relevant. Be encouraging and supportive.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const answer = completion.choices[0].message.content;

    sendSuccess(res, { answer }, 'AI response generated successfully');
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    if (error.status === 401) {
      return sendError(res, 'Invalid OpenAI API key', 401);
    }
    if (error.status === 429) {
      return sendError(res, 'Rate limit exceeded. Please try again later', 429);
    }
    
    next(error);
  }
};

// Get learning path recommendations
export const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (!process.env.OPENAI_API_KEY) {
      return sendError(res, 'OpenAI API key not configured. Please add OPENAI_API_KEY to .env', 500);
    }

    // Call OpenAI API to generate recommendations
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a career coach and learning path advisor. Provide personalized recommendations based on the user profile. Return recommendations in JSON format with nextCourse, suggestedProjects, skillsToLearn, and estimatedTime fields.',
        },
        {
          role: 'user',
          content: `Generate a learning path recommendation for a developer. Return a JSON object with: nextCourse (string), suggestedProjects (array of 3 strings), skillsToLearn (array of 3 strings), estimatedTime (string).`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const recommendationsText = completion.choices[0].message.content;
    
    // Try to parse JSON from response
    let recommendations;
    try {
      recommendations = JSON.parse(recommendationsText);
    } catch {
      recommendations = {
        nextCourse: "Advanced React Patterns",
        suggestedProjects: ["E-commerce Dashboard", "Real-time Chat App", "Portfolio CMS"],
        skillsToLearn: ["TypeScript", "GraphQL", "Docker"],
        estimatedTime: "40 hours"
      };
    }

    sendSuccess(res, recommendations, 'Recommendations generated successfully');
  } catch (error) {
    console.error('OpenAI API Error:', error);
    next(error);
  }
};

// Code review with OpenAI
export const reviewCode = async (req, res, next) => {
  try {
    const { code, language } = req.body;

    if (!code || !code.trim()) {
      return sendError(res, 'Code is required', 400);
    }

    if (!process.env.OPENAI_API_KEY) {
      return sendError(res, 'OpenAI API key not configured. Please add OPENAI_API_KEY to .env', 500);
    }

    // Call OpenAI API for code review
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert code reviewer. Provide constructive feedback on code quality, best practices, and areas for improvement. Be specific and actionable.',
        },
        {
          role: 'user',
          content: `Review this ${language || 'JavaScript'} code:\n\n${code}\n\nProvide feedback on: 1) Code Quality, 2) Best Practices, 3) Improvement Areas, 4) Security Issues (if any).`,
        },
      ],
      temperature: 0.5,
      max_tokens: 800,
    });

    const feedback = completion.choices[0].message.content;

    sendSuccess(res, { feedback, code, language }, 'Code review completed successfully');
  } catch (error) {
    console.error('OpenAI API Error:', error);
    next(error);
  }
};