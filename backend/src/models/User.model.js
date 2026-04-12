// models/user.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: {
      values: ['student', 'admin', 'recruiter', 'organizer'],
      message: 'Role must be one of: student, admin, recruiter, organizer'
    },
    default: 'student'
  },
  skills: [String],
  bio: String,
  avatar: String,
  github: String,
  leetcode: String,
  gfg: String,
  linkedin: String,
  portfolio: String,
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  companyName: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  organizationName: {
    type: String,
    trim: true
  },
  organizationType: {
    type: String,
    trim: true
  },
  // OTP Fields
  resetOTP: {
    type: String,
    select: false
  },
  resetOTPExpiry: {
    type: Date,
    select: false
  },
  isOTPVerified: {
    type: Boolean,
    default: false,
    select: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
