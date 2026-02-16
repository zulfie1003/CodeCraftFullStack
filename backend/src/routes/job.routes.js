// routes/job.routes.js
import express from 'express';
import {
  createJob,
  getAllJobs,
  getJobById,
  matchJobs,
  updateJob,
  deleteJob
} from '../controllers/job.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

router.route('/')
  .get(getAllJobs)
  .post(protect, authorize('admin'), createJob);

router.get('/match', protect, matchJobs);

router.route('/:id')
  .get(getJobById)
  .put(protect, authorize('admin'), updateJob)
  .delete(protect, authorize('admin'), deleteJob);

export default router;