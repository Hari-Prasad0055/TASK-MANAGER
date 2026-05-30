import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  color: { type: String, required: true }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  targetHours: { type: Number, default: 6.0 },
  categories: {
    type: [categorySchema],
    default: [
      { id: 'deep-work', name: 'Deep Work', color: 'var(--cat-work)' },
      { id: 'coding', name: 'Coding', color: 'var(--cat-coding)' },
      { id: 'meetings', name: 'Meetings', color: 'var(--cat-meeting)' },
      { id: 'health', name: 'Health & Sport', color: 'var(--cat-health)' },
      { id: 'admin', name: 'Administrative', color: 'var(--cat-admin)' },
      { id: 'personal', name: 'Personal Growth', color: 'var(--cat-personal)' }
    ]
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
