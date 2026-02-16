// routes/user.routes.js
import express from 'express';
import { getProfile, updateProfile, getUserById } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/:id', getUserById);

export default router;