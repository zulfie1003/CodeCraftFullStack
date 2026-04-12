import express from 'express';
import { executePracticeCode } from '../controllers/practice.controller.js';

const router = express.Router();

router.post('/execute', executePracticeCode);

export default router;
