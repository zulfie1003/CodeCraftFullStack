// middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { sendError } from '../utils/response.js';

// Protect routes middleware
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token found
    if (!token) {
      return sendError(res, 'Not authorized to access this route', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID from token
    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Attach user to request object
    req.user = user;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token', 401);
    }

    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired', 401);
    }

    next(error);
  }
};
