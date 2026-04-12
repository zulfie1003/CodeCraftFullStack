import express from 'express';
import {
  createMentorBooking,
  getMyMentorBookings,
} from '../controllers/mentorBooking.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/mine', protect, getMyMentorBookings);
router.post('/', protect, createMentorBooking);

export default router;
