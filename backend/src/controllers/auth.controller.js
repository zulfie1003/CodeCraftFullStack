// controllers/auth.controller.js
import { randomUUID } from 'node:crypto';
import User from '../models/User.model.js';
import { signToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sendOTPEmail, sendPasswordResetSuccessEmail } from '../utils/email.js';
import { ensureStudentProfile } from '../utils/studentProfile.js';

const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$/;
const GOOGLE_TOKEN_INFO_URL = 'https://oauth2.googleapis.com/tokeninfo';
const PUBLIC_AUTH_ROLES = ['student', 'recruiter', 'organizer'];
const PLACEHOLDER_GOOGLE_CLIENT_ID = 'your-google-client-id';

const isBcryptHash = (value = '') => BCRYPT_HASH_REGEX.test(value);
const isConfiguredGoogleClientId = (value = '') => Boolean(value) && value !== PLACEHOLDER_GOOGLE_CLIENT_ID;

const PROFILE_FIELDS_BY_ROLE = {
  student: ['name', 'phone', 'location', 'website', 'bio', 'avatar', 'github', 'linkedin', 'portfolio'],
  recruiter: ['name', 'phone', 'location', 'website', 'bio', 'avatar', 'companyName', 'industry'],
  organizer: ['name', 'phone', 'location', 'website', 'bio', 'avatar', 'organizationName', 'organizationType'],
  admin: ['name', 'phone', 'location', 'website', 'bio', 'avatar']
};

const normalizePublicRole = (role) => {
  if (role === undefined || role === null || String(role).trim() === '') {
    return 'student';
  }

  const normalizedRole = String(role).trim().toLowerCase();
  return PUBLIC_AUTH_ROLES.includes(normalizedRole) ? normalizedRole : null;
};

const normalizeProfileValue = (field, value) => {
  if (value === null || value === undefined) {
    return '';
  }

  const nextValue = String(value);
  return field === 'avatar' ? nextValue : nextValue.trim();
};

const serializeAuthUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar || ''
});

const buildAuthSession = async (user) => {
  if (user.role === 'student') {
    await ensureStudentProfile(user._id);
  }

  return {
    token: signToken(user._id),
    user: serializeAuthUser(user)
  };
};

const verifyGoogleIdToken = async (idToken) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() || '';

  if (!isConfiguredGoogleClientId(googleClientId)) {
    return {
      error: 'Google sign-in is not configured on the server',
      statusCode: 503
    };
  }

  const verificationUrl = `${GOOGLE_TOKEN_INFO_URL}?id_token=${encodeURIComponent(idToken)}`;

  try {
    const response = await fetch(verificationUrl, {
      signal: AbortSignal.timeout(10000)
    });

    const payload = await response.json();

    if (!response.ok || payload.error) {
      return {
        error: payload.error_description || payload.error || 'Unable to verify Google credential',
        statusCode: 401
      };
    }

    if (payload.aud !== googleClientId) {
      return {
        error: 'Google credential was issued for a different client',
        statusCode: 401
      };
    }

    if (payload.email_verified !== 'true') {
      return {
        error: 'Google account email is not verified',
        statusCode: 401
      };
    }

    return { payload };
  } catch (error) {
    console.error('Google token verification error:', error);

    return {
      error: 'Unable to verify Google sign-in at the moment',
      statusCode: 502
    };
  }
};

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
    const normalizedRole = normalizePublicRole(role);

    if (!normalizedRole) {
      return sendError(res, 'Please choose a valid role', 400);
    }

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
      role: normalizedRole
    });

    const authSession = await buildAuthSession(user);

    sendSuccess(res, authSession, 'Registration successful', 201);

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

    if (isBcryptHash(user.password)) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return sendError(res, 'Invalid credentials', 401);
      }
    } else {
      if (user.password !== password) {
        return sendError(res, 'Invalid credentials', 401);
      }

      // Repair legacy plain-text passwords left by the old reset flow.
      user.password = password;
      await user.save();
    }

    if (role && user.role !== String(role).trim().toLowerCase()) {
      return sendError(res, `This account is registered as ${user.role}`, 403);
    }

    const authSession = await buildAuthSession(user);

    sendSuccess(res, authSession, 'Login successful');

  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    const { idToken, role } = req.body;

    if (!idToken || !String(idToken).trim()) {
      return sendError(res, 'Google credential is required', 400);
    }

    const normalizedRole = normalizePublicRole(role);
    if (!normalizedRole) {
      return sendError(res, 'Please choose a valid role', 400);
    }

    const { payload, error, statusCode } = await verifyGoogleIdToken(String(idToken).trim());

    if (error) {
      return sendError(res, error, statusCode || 401);
    }

    if (!payload.email?.trim()) {
      return sendError(res, 'Google account email is unavailable', 401);
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    const googleId = payload.sub?.trim();

    if (!googleId) {
      return sendError(res, 'Google account verification failed', 401);
    }

    const existingGoogleUser = await User.findOne({ googleId });
    const existingEmailUser = await User.findOne({ email: normalizedEmail });

    if (
      existingGoogleUser &&
      existingEmailUser &&
      existingGoogleUser._id.toString() !== existingEmailUser._id.toString()
    ) {
      return sendError(res, 'This Google account conflicts with an existing user record', 409);
    }

    if (existingEmailUser?.googleId && existingEmailUser.googleId !== googleId) {
      return sendError(res, 'This email is already linked to a different Google account', 409);
    }

    const user = existingGoogleUser || existingEmailUser;

    if (user) {
      if (user.role !== normalizedRole) {
        return sendError(res, `This account is registered as ${user.role}`, 403);
      }

      let shouldSave = false;

      if (!user.googleId) {
        user.googleId = googleId;
        shouldSave = true;
      }

      if (!user.avatar && payload.picture?.trim()) {
        user.avatar = payload.picture.trim();
        shouldSave = true;
      }

      if (!user.name && payload.name?.trim()) {
        user.name = payload.name.trim();
        shouldSave = true;
      }

      if (shouldSave) {
        await user.save();
      }
    } else {
      const createdUser = await User.create({
        name: payload.name?.trim() || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: `google-${randomUUID()}`,
        role: normalizedRole,
        googleId,
        avatar: payload.picture?.trim() || ''
      });

      const authSession = await buildAuthSession(createdUser);
      return sendSuccess(
        res,
        authSession,
        'Google account created successfully',
        201
      );
    }

    const authSession = await buildAuthSession(user);

    sendSuccess(res, authSession, 'Google sign-in successful');
  } catch (error) {
    console.error('Google Auth Error:', error);
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

export const updateMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const allowedFields = PROFILE_FIELDS_BY_ROLE[user.role] || PROFILE_FIELDS_BY_ROLE.admin;

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        user[field] = normalizeProfileValue(field, req.body[field]);
      }
    });

    await user.save();

    sendSuccess(res, { user }, 'Profile updated successfully');
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
    
    const user = await User.findOne({ email: trimmedEmail }).select('+isOTPVerified +resetOTP +resetOTPExpiry');
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Verify OTP was completed
    if (!user.isOTPVerified) {
      return sendError(res, 'Please verify OTP first', 400);
    }

    user.password = password;
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    user.isOTPVerified = false;
    await user.save();

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
