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
