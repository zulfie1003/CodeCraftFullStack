// models/Project.model.js
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  technologies: [String],
  category: {
    type: String,
    enum: ['web', 'mobile', 'ml', 'game', 'other'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  githubUrl: String,
  liveUrl: String,
  images: [String],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  }
}, {
  timestamps: true
});

// Index for search optimization
projectSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Project', projectSchema);