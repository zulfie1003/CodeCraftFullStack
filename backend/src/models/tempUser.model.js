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
  linkedin: String,
  portfolio: String,
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