import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    theme: {
      type: String,
      required: true,
      trim: true,
    },
    rules: {
      type: String,
      required: true,
      trim: true,
    },
    teamSizeLimit: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    deadline: {
      type: Date,
      required: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "open", "closed"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ organizer: 1, createdAt: -1 });
eventSchema.index({ status: 1, deadline: 1 });

export default mongoose.model("Event", eventSchema);
