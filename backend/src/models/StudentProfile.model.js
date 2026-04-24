import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const experienceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      enum: ["internship", "fulltime", "parttime", "contract", "freelance", "leadership", "other"],
      default: "other",
    },
    duration: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    link: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: true }
);

const resumeSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      trim: true,
    },
    dataUrl: {
      type: String,
    },
    text: {
      type: String,
    },
    uploadedAt: {
      type: Date,
    },
  },
  { _id: false }
);

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    college: {
      type: String,
      trim: true,
      default: "",
    },
    degree: {
      type: String,
      trim: true,
      default: "",
    },
    year: {
      type: String,
      trim: true,
      default: "",
    },
    experienceLevel: {
      type: String,
      enum: ["fresher", "junior", "mid", "senior"],
      default: "fresher",
    },
    skills: {
      type: [String],
      default: [],
    },
    projects: {
      type: [projectSchema],
      default: [],
    },
    experiences: {
      type: [experienceSchema],
      default: [],
    },
    resume: {
      type: resumeSchema,
      default: () => ({}),
    },
    githubUrl: {
      type: String,
      trim: true,
      default: "",
    },
    leetcodeUrl: {
      type: String,
      trim: true,
      default: "",
    },
    gfgUrl: {
      type: String,
      trim: true,
      default: "",
    },
    portfolioUrl: {
      type: String,
      trim: true,
      default: "",
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

studentProfileSchema.index({ skills: 1, experienceLevel: 1, year: 1 });

export default mongoose.model("StudentProfile", studentProfileSchema);
