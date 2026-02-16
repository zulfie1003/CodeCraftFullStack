// // server.js
// import 'dotenv/config.js';
// import app from './app.js';
// import connectDB from './config/db.js';

// const PORT = process.env.PORT || 5000;

// // Connect to Database
// connectDB();

// // Start Server
// app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);
//   console.log(`📊 Environment: ${process.env.NODE_ENV}`);
// });
import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0';

// Connect DB
connectDB();

// Start Server
app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on ${HOST}:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});
