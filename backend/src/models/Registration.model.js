import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "shortlisted", "rejected"],
      default: "pending",
    },
    teamName: {
      type: String,
      trim: true,
      default: "",
    },
    teamMembers: {
      type: [String],
      default: [],
    },
    submissionUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

registrationSchema.index({ event: 1, student: 1 }, { unique: true });
registrationSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Registration", registrationSchema);
