// routes/project.routes.js
import express from 'express';
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  toggleLike
} from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(getAllProjects)
  .post(protect, createProject);

router.route('/:id')
  .get(getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.post('/:id/like', protect, toggleLike);

export default router;