// controllers/user.controller.js
import User from '../models/User.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

// Get user profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = ['name', 'bio', 'skills', 'avatar', 'github', 'linkedin', 'portfolio'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    sendSuccess(res, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// Get user by ID (public profile)
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};