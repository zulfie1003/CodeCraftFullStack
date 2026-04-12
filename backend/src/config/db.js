// config/db.js
import mongoose from 'mongoose';

mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 5000);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL, {
      serverSelectionTimeoutMS: 5000,
    });

    conn.connection.on('disconnected', () => {
      console.error('❌ MongoDB disconnected');
    });

    conn.connection.on('error', (error) => {
      console.error(`❌ MongoDB runtime error: ${error.message}`);
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
