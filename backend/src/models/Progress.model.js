// models/Progress.model.js
import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  learningPath: {
    type: String,
    enum: ['web', 'mobile', 'ml', 'devops', 'game'],
    required: true
  },
  completedModules: [{
    moduleName: String,
    completedAt: Date
  }],
  currentModule: String,
  skillsAcquired: [String],
  projectsCompleted: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  totalHours: {
    type: Number,
    default: 0
  },
  streak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastActive: Date
  },
  certificates: [{
    name: String,
    issuedAt: Date,
    url: String
  }]
}, {
  timestamps: true
});

// Ensure one progress per user per learning path
progressSchema.index({ user: 1, learningPath: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);