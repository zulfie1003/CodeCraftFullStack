// routes/job.routes.js
import express from 'express';
import {
  createJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  matchJobs,
  updateJob,
  deleteJob
} from '../controllers/job.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

router.route('/')
  .get(getAllJobs)
  .post(protect, authorize('admin', 'recruiter'), createJob);

router.get('/match', protect, matchJobs);
router.get('/mine', protect, authorize('admin', 'recruiter'), getMyJobs);

router.route('/:id')
  .get(getJobById)
  .put(protect, authorize('admin', 'recruiter'), updateJob)
  .delete(protect, authorize('admin', 'recruiter'), deleteJob);

export default router;
