// routes/user.routes.js
import express from 'express';
import {
  getProfile,
  updateProfile,
  saveProfile,
  getPublicUserStats,
  getUserById,
} from '../controllers/user.controller.js';
import { getPlatformStats } from '../controllers/platformStats.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/public-stats', getPublicUserStats);
router.get('/profile', protect, getProfile);
router.post('/profile', protect, saveProfile);
router.put('/profile', protect, updateProfile);
router.post('/platform-stats', protect, getPlatformStats);
router.get('/:id', getUserById);

export default router;
