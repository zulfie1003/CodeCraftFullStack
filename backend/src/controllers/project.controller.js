// controllers/project.controller.js
import Project from '../models/Project.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

// Create project
export const createProject = async (req, res, next) => {
  try {
    const projectData = {
      ...req.body,
      user: req.user.id
    };

    const project = await Project.create(projectData);
    await project.populate('user', 'name email avatar');

    sendSuccess(res, { project }, 'Project created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// Get all projects
export const getAllProjects = async (req, res, next) => {
  try {
    const { category, difficulty, search, page = 1, limit = 10 } = req.query;
    
    const filter = { status: 'published' };
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const projects = await Project.find(filter)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(filter);

    sendSuccess(res, {
      projects,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single project
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('user', 'name email avatar bio github linkedin');

    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    sendSuccess(res, { project });
  } catch (error) {
    next(error);
  }
};

// Update project
export const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    // Check ownership
    if (project.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to update this project', 403);
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name avatar');

    sendSuccess(res, { project }, 'Project updated successfully');
  } catch (error) {
    next(error);
  }
};

// Delete project
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    // Check ownership
    if (project.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to delete this project', 403);
    }

    await project.deleteOne();

    sendSuccess(res, null, 'Project deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Like/Unlike project
export const toggleLike = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    const likeIndex = project.likes.indexOf(req.user.id);

    if (likeIndex === -1) {
      project.likes.push(req.user.id);
    } else {
      project.likes.splice(likeIndex, 1);
    }

    await project.save();

    sendSuccess(res, { 
      likes: project.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    next(error);
  }
};