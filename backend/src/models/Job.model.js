import mongoose from 'mongoose';
import {
  buildJobDedupeKey,
  isValidHttpUrl,
  MAX_JOB_DESCRIPTION_CHARS,
  normalizeJobDescription,
  normalizeExperienceText,
  normalizeSkills,
  normalizeStringArray,
} from '../utils/jobMatching.js';

const salarySchema = new mongoose.Schema(
  {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required']
  },
  source: {
    type: String,
    enum: ['manual', 'company', 'adzuna', 'rapidapi', 'naukri', 'other'],
    default: 'manual'
  },
  sourceJobId: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['internship', 'fulltime', 'parttime', 'contract'],
    default: 'fulltime'
  },
  experience: {
    type: String,
    trim: true,
    default: 'Not specified'
  },
  experienceLevel: {
    type: String,
    enum: ['fresher', 'junior', 'mid', 'senior'],
    default: 'fresher'
  },
  location: {
    type: String,
    required: true
  },
  remote: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    required: true,
    maxlength: MAX_JOB_DESCRIPTION_CHARS
  },
  requirements: [String],
  skills: [String],
  salary: salarySchema,
  salaryText: {
    type: String,
    trim: true
  },
  applyUrl: {
    type: String,
    required: true,
    validate: {
      validator: (value) => isValidHttpUrl(value),
      message: 'applyUrl must be a valid http(s) URL'
    }
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dedupeKey: {
    type: String,
    required: true,
    index: true
  },
  postedAt: Date,
  lastSyncedAt: Date,
  expiresAt: Date,
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  }
}, {
  timestamps: true
});

jobSchema.pre('validate', function(next) {
  this.title = String(this.title || '').trim();
  this.company = String(this.company || '').trim();
  this.location = String(this.location || '').trim();
  this.description = normalizeJobDescription(this.description);
  this.skills = normalizeSkills(this.skills);
  this.requirements = normalizeStringArray(this.requirements);
  this.experience = normalizeExperienceText(this.experience, this.experienceLevel);
  this.dedupeKey = buildJobDedupeKey(this);

  if (this.salary?.currency) {
    this.salary.currency = String(this.salary.currency || 'USD').trim().toUpperCase();
  }

  next();
});

jobSchema.index({ title: 'text', description: 'text', company: 'text', location: 'text', skills: 'text' });
jobSchema.index({ skills: 1, type: 1, experienceLevel: 1, location: 1, status: 1, source: 1 });

export default mongoose.model('Job', jobSchema);
