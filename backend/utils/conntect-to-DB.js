// db.js - Database connection utility
import mongoose from 'mongoose';

const connectDB =  async () => {
  // If already connected, reuse the connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  
  // If disconnected, create new connection
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(process.env.DB_URL, {
        bufferCommands: false, // Disable mongoose buffering for serverless
        maxPoolSize: 1, // Limit connection pool for serverless
      });
      console.log('MongoDB connected');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
  
  return mongoose.connection;
};
export default connectDB;
