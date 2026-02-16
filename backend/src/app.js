// app.js
import express from 'express';
import cors from 'cors';
import corsConfig from './config/cors.js';
import errorMiddleware from './middleware/error.middleware.js';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import jobRoutes from './routes/job.routes.js';
import aiRoutes from './routes/ai.routes.js';

const app = express();

// ========================
// Middleware
// ========================

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors(corsConfig));

// ========================
// Routes
// ========================

// Root Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CodeCraft Backend API is running 🚀'
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/job', jobRoutes);
app.use('/api/ai', aiRoutes);

// ========================
// 404 Handler (Must be after routes)
// ========================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ========================
// Global Error Handler (Always Last)
// ========================
app.use(errorMiddleware);

export default app;
