// controllers/auth.controller.js
import User from '../models/user.model.js';
import { signToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sendOTPEmail, sendPasswordResetSuccessEmail } from '../utils/email.js';

// Register new user
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters', 400);
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return sendError(res, 'Email already registered', 400);
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: role || 'student'
    });

    // Generate token
    const token = signToken(user._id);

    sendSuccess(res, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, 'Registration successful', 201);

  } catch (error) {
    console.error('Register Error:', error);
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password) {
      return sendError(res, 'Please provide email and password', 400);
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find user with password
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Generate token
    const token = signToken(user._id);

    sendSuccess(res, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, 'Login successful');

  } catch (error) {
    next(error);
  }
};

// Get current user
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    sendSuccess(res, { user }, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Forgot password - Generate and send OTP
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate email is provided
    if (!email || !email.trim()) {
      return sendError(res, 'Please provide an email', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return sendError(res, 'Please provide a valid email', 400);
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return sendSuccess(res, {
        message: 'If an account with this email exists, an OTP will be sent shortly'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Update OTP fields using findByIdAndUpdate to avoid full document validation
    await User.findByIdAndUpdate(
      user._id,
      {
        resetOTP: otp,
        resetOTPExpiry: otpExpiry,
        isOTPVerified: false
      },
      { new: true }
    );

    // Send OTP via email
    try {
      await sendOTPEmail(trimmedEmail, otp);
    } catch (emailError) {
      console.error('⚠️  OTP generated but email failed:', emailError.message);
      // Continue anyway - OTP is still valid
    }

    console.log(`🔐 OTP for ${trimmedEmail}: ${otp} (Expires in 10 minutes)`);

    sendSuccess(res, {
      message: 'OTP sent to your email',
      email: trimmedEmail,
      // For development/testing - remove in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    next(error);
  }
};

// Verify OTP
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !email.trim() || !otp || !otp.trim()) {
      return sendError(res, 'Email and OTP are required', 400);
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();

    const user = await User.findOne({ email: trimmedEmail }).select('+resetOTP +resetOTPExpiry');
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Check if OTP exists and not expired
    if (!user.resetOTP || !user.resetOTPExpiry) {
      return sendError(res, 'No OTP found. Please request a new one', 400);
    }

    if (new Date() > user.resetOTPExpiry) {
      return sendError(res, 'OTP expired. Please request a new one', 400);
    }

    // Verify OTP
    if (user.resetOTP !== trimmedOtp) {
      return sendError(res, 'Invalid OTP', 400);
    }

    // Mark OTP as verified using findByIdAndUpdate
    await User.findByIdAndUpdate(
      user._id,
      { isOTPVerified: true },
      { new: true }
    );

    // Generate a temporary token for password reset
    const resetToken = Buffer.from(trimmedEmail + Date.now()).toString('base64');

    sendSuccess(res, {
      message: 'OTP verified successfully',
      resetToken: resetToken
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    next(error);
  }
};

// Reset password (after OTP verification)
export const resetPassword = async (req, res, next) => {
  try {
    const { email, password, resetToken } = req.body;

    if (!email || !email.trim() || !password || !password.trim() || !resetToken) {
      return sendError(res, 'Email, password, and reset token are required', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters', 400);
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    const user = await User.findOne({ email: trimmedEmail }).select('+isOTPVerified');
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Verify OTP was completed
    if (!user.isOTPVerified) {
      return sendError(res, 'Please verify OTP first', 400);
    }

    // Update password and clear OTP fields using findByIdAndUpdate
    await User.findByIdAndUpdate(
      user._id,
      {
        password: password,
        resetOTP: undefined,
        resetOTPExpiry: undefined,
        isOTPVerified: false
      },
      { new: true }
    );

    // Send confirmation email
    try {
      await sendPasswordResetSuccessEmail(trimmedEmail, user.name);
    } catch (emailError) {
      console.error('⚠️  Password reset but confirmation email failed:', emailError.message);
      // Continue anyway - password is already reset
    }

    sendSuccess(res, {
      message: 'Password reset successful. Please login with your new password'
    });

  } catch (error) {
    console.error('Reset Password Error:', error);
    next(error);
  }
};