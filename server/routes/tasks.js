import express from 'express';
import Task from '../models/Task.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Fetch all tasks for logged-in user
// @route   GET /api/tasks
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id });
    res.json(tasks);
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// @desc    Upsert a task (Insert or Update by client task ID)
// @route   POST /api/tasks
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { id, title, category, priority, startTime, endTime, status, notes, date } = req.body;

    if (!id || !title || !category || !startTime || !endTime || !status || !date) {
      return res.status(400).json({ message: 'Missing required task fields' });
    }

    const updatedTask = await Task.findOneAndUpdate(
      { userId: req.user._id, id: id },
      {
        userId: req.user._id,
        id,
        title,
        category,
        priority,
        startTime,
        endTime,
        status,
        notes,
        date
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(updatedTask);
  } catch (error) {
    console.error('Upsert task error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// @desc    Batch sync multiple tasks (ideal for offline cache synchronization or import backup)
// @route   POST /api/tasks/sync
// @access  Private
router.post('/sync', protect, async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ message: 'Tasks must be provided as an array' });
    }

    const bulkOps = tasks.map(task => ({
      updateOne: {
        filter: { userId: req.user._id, id: task.id },
        update: {
          $set: {
            userId: req.user._id,
            id: task.id,
            title: task.title,
            category: task.category,
            priority: task.priority || 'medium',
            startTime: task.startTime,
            endTime: task.endTime,
            status: task.status || 'pending',
            notes: task.notes || '',
            date: task.date
          }
        },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await Task.bulkWrite(bulkOps);
    }

    res.json({ message: `Successfully synced ${tasks.length} tasks` });
  } catch (error) {
    console.error('Bulk sync tasks error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// @desc    Delete a specific task by client ID
// @route   DELETE /api/tasks/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Task.findOneAndDelete({ userId: req.user._id, id: id });

    if (!deleted) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task removed successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// @desc    Purge all tasks for user
// @route   DELETE /api/tasks
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    await Task.deleteMany({ userId: req.user._id });
    res.json({ message: 'All tasks purged successfully' });
  } catch (error) {
    console.error('Purge tasks error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
