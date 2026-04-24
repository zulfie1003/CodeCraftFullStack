// app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";

import corsConfig from "./config/cors.js";
import errorMiddleware from "./middleware/error.middleware.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import jobRoutes from "./routes/job.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import mentorBookingRoutes from "./routes/mentorBooking.routes.js";
import practiceRoutes from "./routes/practice.routes.js";
import studentProfileRoutes from "./routes/studentProfile.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import eventRoutes from "./routes/event.routes.js";
import registrationRoutes from "./routes/registration.routes.js";
import resumeRoutes from "./routes/resume.routes.js";

const app = express();
const requestBodyLimit = process.env.REQUEST_BODY_LIMIT || "12mb";

// ========================
// Global Middlewares
// ========================

// CORS should run first so browser preflight requests are handled before other middleware.
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

// Security headers
app.use(
  helmet({
    crossOriginOpenerPolicy: {
      policy: "same-origin-allow-popups",
    },
  })
);

// Logger
app.use(morgan("dev"));

// Body Parsers
app.use(express.json({ limit: requestBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: requestBodyLimit }));

// ========================
// Health & Root Routes
// ========================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 CodeCraft Backend API running"
  });
});

app.get("/health", (req, res) => {
  const readyState = mongoose.connection.readyState;
  const dbStatus =
    readyState === 1
      ? "connected"
      : readyState === 2
        ? "connecting"
        : readyState === 3
          ? "disconnecting"
          : "disconnected";

  res.status(200).json({
    success: true,
    status: "ok",
    database: dbStatus,
    timestamp: new Date()
  });
});

// ========================
// API Routes
// ========================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/student-profiles", studentProfileRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/mentor-bookings", mentorBookingRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/resume", resumeRoutes);

// ========================
// 404 Route Handler
// ========================

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ========================
// Global Error Handler
// ========================

app.use(errorMiddleware);

export default app;
