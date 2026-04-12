// routes/ai.routes.js
import express from 'express';
import {
  askAI,
  askAIStream,
  generateRoadmap,
  getRecommendations,
  reviewCode
} from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public AI Mentor route (no auth required)
router.post('/mentor', askAI);
router.post('/mentor-stream', askAIStream);
router.post('/roadmap', generateRoadmap);

// Protected routes
router.post('/ask', protect, askAI);
router.post('/ask-stream', protect, askAIStream);
router.get('/recommendations', protect, getRecommendations);
router.post('/review', protect, reviewCode);

export default router;
