import mongoose from 'mongoose';

const mentorBookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mentorId: {
      type: String,
      required: true,
      trim: true,
    },
    mentorName: {
      type: String,
      required: true,
      trim: true,
    },
    mentorEmail: {
      type: String,
      trim: true,
      default: '',
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    studentEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    studentPhone: {
      type: String,
      required: true,
      trim: true,
    },
    queryCategory: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      required: true,
      trim: true,
    },
    preferredDate: {
      type: Date,
      required: true,
    },
    timezone: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      enum: [30, 60, 90],
    },
    meetingMode: {
      type: String,
      required: true,
      enum: ['Google Meet', 'Zoom', 'Phone Call', 'Email'],
    },
    notificationStatus: {
      studentEmailSent: {
        type: Boolean,
        default: false,
      },
      mentorEmailSent: {
        type: Boolean,
        default: false,
      },
      skippedReason: {
        type: String,
        default: '',
      },
      lastError: {
        type: String,
        default: '',
      },
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
  },
  {
    timestamps: true,
  }
);

mentorBookingSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('MentorBooking', mentorBookingSchema);
