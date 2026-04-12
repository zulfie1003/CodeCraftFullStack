import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected"],
      default: "applied",
    },
    coverLetter: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ job: 1, student: 1 }, { unique: true });
applicationSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Application", applicationSchema);
