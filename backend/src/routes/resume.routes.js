import express from 'express';
import { extractResumeSkills } from '../controllers/resume.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, extractResumeSkills);

export default router;
