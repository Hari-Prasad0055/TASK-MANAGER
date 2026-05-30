import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  id: { type: String, required: true }, // Client task string id, e.g. "task-123456"
  title: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  startTime: { type: String, required: true }, // "HH:MM"
  endTime: { type: String, required: true }, // "HH:MM"
  status: { type: String, enum: ['pending', 'in progress', 'completed', 'skipped'], default: 'pending' },
  notes: { type: String, default: '' },
  date: { type: String, required: true } // "YYYY-MM-DD"
}, { timestamps: true });

// Prevent duplicate task ID for the same user
taskSchema.index({ userId: 1, id: 1 }, { unique: true });

const Task = mongoose.model('Task', taskSchema);
export default Task;
