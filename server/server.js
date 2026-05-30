import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection state validation middleware (crucial for cold starts and clear errors on Vercel)
app.use(async (req, res, next) => {
  if (req.path === '/api/health') return next();

  if (mongoose.connection.readyState !== 1) {
    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskmanager';
      
      if (mongoose.connection.readyState === 0) {
        // Disconnected - attempt connection
        console.log('Database not connected. Attempting connection...');
        await mongoose.connect(mongoURI);
      } else if (mongoose.connection.readyState === 2) {
        // Connecting - wait for it
        console.log('Database connection in progress, waiting...');
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Database connection timed out')), 5000);
          mongoose.connection.once('connected', () => {
            clearTimeout(timeout);
            resolve();
          });
          mongoose.connection.once('error', (err) => {
            clearTimeout(timeout);
            reject(err);
          });
        });
      }
    } catch (error) {
      console.error('Database connection failure in serverless middleware:', error);
      return res.status(503).json({
        message: 'Database connection failed. If you are running in production on Vercel, please make sure you have added the MONGODB_URI environment variable (pointing to a cloud MongoDB Atlas instance) under Vercel Settings.'
      });
    }
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Task Manager fullstack backend is running' });
});

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskmanager';
mongoose.connect(mongoURI)
  .then(() => {
    console.log('=== MongoDB Connected Successfully ===');
  })
  .catch((error) => {
    console.error('!!! MongoDB connection error:', error);
  });

// Only listen on port if not in serverless context (Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=== Server listening on port ${PORT} ===`);
  });
}

export default app;
