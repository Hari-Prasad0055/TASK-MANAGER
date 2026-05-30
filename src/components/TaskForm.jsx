import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Calendar } from 'lucide-react';
import { timeToDecimal } from '../utils/productivity';

export default function TaskForm({ isOpen, onClose, onSave, editingTask, categories }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Hydrate fields if editing a task
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setCategory(editingTask.category);
      setPriority(editingTask.priority);
      setStartTime(editingTask.startTime);
      setEndTime(editingTask.endTime);
      setStatus(editingTask.status);
      setNotes(editingTask.notes || '');
      setError('');
    } else {
      // Defaults for new task
      setTitle('');
      setCategory(categories[0]?.name || 'Deep Work');
      setPriority('medium');
      setStartTime('09:00');
      setEndTime('10:00');
      setStatus('pending');
      setNotes('');
      setError('');
    }
  }, [editingTask, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    const startVal = timeToDecimal(startTime);
    const endVal = timeToDecimal(endTime);

    if (endVal <= startVal) {
      setError('Invalid Schedule: End Time must be strictly after Start Time.');
      return;
    }

    const taskData = {
      id: editingTask ? editingTask.id : `task-${Date.now()}`,
      title: title.trim(),
      category,
      priority,
      startTime,
      endTime,
      status,
      notes: notes.trim(),
      date: editingTask ? editingTask.date : undefined // Will be set by App.jsx
    };

    onSave(taskData);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="panel-title">
            <Calendar size={18} className="text-teal" />
            {editingTask ? 'Edit Scheduled Task' : 'Schedule New Task'}
          </h2>
          <button onClick={onClose} className="btn-close" title="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="validation-alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Product / Task Title</label>
              <input
                type="text"
                placeholder="e.g., Design checkout flows, run 5k, deep focus..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                autoFocus
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-input select-input"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="form-input select-input"
                >
                  <option value="high">🔴 High Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="low">🟢 Low Priority</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Status</label>
                <div className="status-grid">
                  {[
                    { id: 'pending', label: 'Pending', color: 'var(--color-pending)', text: 'var(--text-pending)' },
                    { id: 'in progress', label: 'In Progress', color: 'var(--color-progress)', text: 'var(--text-progress)' },
                    { id: 'completed', label: 'Completed', color: 'var(--color-completed)', text: 'var(--text-completed)' },
                    { id: 'skipped', label: 'Skipped', color: 'var(--color-skipped)', text: 'var(--text-skipped)' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStatus(s.id)}
                      className={`status-selector-btn ${status === s.id ? 'active' : ''}`}
                      style={{
                        '--btn-bg': s.color,
                        '--btn-text': s.text
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes & Specifications (Optional)</label>
              <textarea
                placeholder="Key deliverables, subtasks, or focus reminders..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input text-area"
                rows={3}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTask ? 'Apply Changes' : 'Schedule Task'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .text-teal {
          color: var(--brand-primary);
        }

        .btn-close {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
        }

        .btn-close:hover {
          background-color: var(--bg-primary);
          color: var(--text-primary);
        }

        .select-input {
          cursor: pointer;
        }

        .text-area {
          resize: none;
          font-family: var(--font-sans);
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }

        .status-selector-btn {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.5rem 0.25rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background-color: var(--bg-primary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition-smooth);
          text-align: center;
        }

        .status-selector-btn:hover {
          border-color: var(--text-muted);
          background-color: #f1f5f9;
        }

        .status-selector-btn.active {
          background-color: var(--btn-bg);
          color: var(--btn-text);
          border-color: transparent;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
      `}</style>
    </div>
  );
}
