import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import { startJobSyncScheduler } from './services/jobSync.scheduler.js';

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const startServer = async () => {
  try {
    // Connect Database
    await connectDB();
    console.log("✅ Database Connected");

    // Start Server
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running at http://${HOST}:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      startJobSyncScheduler();
    });

  } catch (error) {
    console.error("❌ Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();
