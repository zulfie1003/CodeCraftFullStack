// routes/ai.routes.js
import express from 'express';
import {
  askAI,
  getRecommendations,
  reviewCode
} from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public AI Mentor route (no auth required)
router.post('/mentor', askAI);

// Protected routes
router.post('/ask', protect, askAI);
router.get('/recommendations', protect, getRecommendations);
router.post('/review', protect, reviewCode);

export default router;