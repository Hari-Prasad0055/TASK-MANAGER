import React from 'react';
import { 
  Plus, 
  Clock, 
  Check, 
  RotateCcw,
  Edit2, 
  Trash2,
  AlertTriangle,
  FolderDot,
  XCircle,
  Eye
} from 'lucide-react';
import { timeToDecimal } from '../utils/productivity';

export default function TaskTimeline({ 
  tasks, 
  onAddTaskClick, 
  onEditTaskClick, 
  onDeleteTask, 
  onToggleStatus 
}) {
  
  // Hours array from 6:00 AM to 11:00 PM (18 hour window, supporting tasks up to 11:30 PM)
  const timelineHours = Array.from({ length: 18 }, (_, i) => 6 + i); // 6 to 23

  // Helper: Format hour number to AM/PM string
  const formatHourLabel = (hour) => {
    if (hour === 12) return '12:00 PM';
    return hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
  };

  // Filter tasks into early (before 6am), core (6am to 11pm), and late (after 11pm)
  const earlyTasks = tasks.filter(t => timeToDecimal(t.startTime) < 6);
  const lateTasks = tasks.filter(t => timeToDecimal(t.startTime) >= 24);
  
  // Get tasks for a specific hour block (starts between hour and hour.99)
  const getTasksForHour = (hour) => {
    return tasks.filter(t => {
      const start = timeToDecimal(t.startTime);
      return start >= hour && start < hour + 1;
    });
  };

  const getPriorityBadgeClass = (priority) => {
    if (priority === 'high') return 'badge-priority-high';
    if (priority === 'low') return 'badge-priority-low';
    return 'badge-priority-medium';
  };

  // Render a task item card
  const renderTaskCard = (task) => {
    const isCompleted = task.status === 'completed';
    const isSkipped = task.status === 'skipped';
    
    return (
      <div key={task.id} className={`task-card ${task.status.replace(' ', '-')}`}>
        <div className="task-card-header">
          <div className="task-check-wrapper">
            <button 
              onClick={() => onToggleStatus(task.id, isCompleted ? 'pending' : 'completed')}
              className={`timeline-checkbox ${isCompleted ? 'checked' : ''}`}
              title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
            >
              {isCompleted && <Check size={12} />}
            </button>
            <div className="task-title-group">
              <h4 className="task-title">{task.title}</h4>
              {task.notes && <p className="task-notes-preview">{task.notes}</p>}
            </div>
          </div>

          <div className="task-actions-row">
            <button 
              onClick={() => onEditTaskClick(task)} 
              className="action-btn"
              title="Edit Task"
            >
              <Edit2 size={13} />
            </button>
            <button 
              onClick={() => onDeleteTask(task.id)} 
              className="action-btn delete"
              title="Delete Task"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <div className="task-meta">
          <span className="task-time-pill">
            <Clock size={11} />
            <span>{task.startTime} - {task.endTime}</span>
          </span>

          <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
            {task.priority}
          </span>

          <span className="task-cat-pill">
            <FolderDot size={11} className="cat-icon" />
            <span>{task.category}</span>
          </span>

          {/* Quick status cycle toggle */}
          <div className="quick-status-container">
            {!isCompleted && !isSkipped && (
              <button 
                onClick={() => onToggleStatus(task.id, 'skipped')} 
                className="status-toggle-dot skip" 
                title="Skip Task"
              >
                <XCircle size={12} />
              </button>
            )}
            {isSkipped && (
              <button 
                onClick={() => onToggleStatus(task.id, 'pending')} 
                className="status-toggle-dot restore" 
                title="Restore Task"
              >
                <RotateCcw size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="timeline-container">
      {/* Early Morning Tasks Drawer */}
      {earlyTasks.length > 0 && (
        <div className="off-hours-section">
          <div className="off-hours-header">
            <Clock size={14} />
            <span>Early Morning Schedule (Before 6:00 AM)</span>
            <span className="count-tag">{earlyTasks.length} tasks</span>
          </div>
          <div className="off-hours-grid">
            {earlyTasks.map(renderTaskCard)}
          </div>
        </div>
      )}

      {/* Main timeline schedule grid */}
      <div className="timeline-grid">
        {timelineHours.map((hour) => {
          const hourTasks = getTasksForHour(hour);
          const hasTasks = hourTasks.length > 0;

          return (
            <div key={hour} className="timeline-row">
              <div className="timeline-time-col">
                <span className="time-label">{formatHourLabel(hour)}</span>
                <div className="timeline-bullet"></div>
              </div>

              <div className="timeline-tasks-col">
                {hasTasks ? (
                  <div className="timeline-tasks-wrapper">
                    {hourTasks.map(renderTaskCard)}
                  </div>
                ) : (
                  <div className="timeline-empty-slot">
                    <button 
                      onClick={() => onAddTaskClick(hour)} 
                      className="quick-add-timeline-btn"
                    >
                      <Plus size={12} />
                      <span>Schedule at {formatHourLabel(hour).replace(':00', '')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Late Evening Tasks Drawer */}
      {lateTasks.length > 0 && (
        <div className="off-hours-section footer-hours">
          <div className="off-hours-header">
            <Clock size={14} />
            <span>Late Night Schedule (Midnight onwards)</span>
            <span className="count-tag">{lateTasks.length} tasks</span>
          </div>
          <div className="off-hours-grid">
            {lateTasks.map(renderTaskCard)}
          </div>
        </div>
      )}

      <style>{`
        .timeline-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .off-hours-section {
          background-color: #f8fafc;
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem;
        }

        .off-hours-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-display);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }

        .count-tag {
          font-size: 0.7rem;
          background-color: var(--border-color);
          color: var(--text-secondary);
          padding: 0.05rem 0.35rem;
          border-radius: 4px;
          margin-left: auto;
        }

        .off-hours-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .timeline-grid {
          position: relative;
          display: flex;
          flex-direction: column;
          padding-left: 0.5rem;
        }

        /* Timeline Connector Vertical Line */
        .timeline-grid::before {
          content: '';
          position: absolute;
          left: 77px;
          top: 15px;
          bottom: 15px;
          width: 2px;
          background-color: var(--border-color);
          z-index: 1;
        }

        .timeline-row {
          display: flex;
          min-height: 70px;
          position: relative;
          z-index: 2;
        }

        .timeline-time-col {
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          width: 72px;
          padding-right: 1.25rem;
          padding-top: 6px;
        }

        .time-label {
          font-family: var(--font-display);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-align: right;
          white-space: nowrap;
        }

        .timeline-bullet {
          position: absolute;
          left: 73px;
          top: 10px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #cbd5e1;
          border: 2px solid white;
          z-index: 10;
          transition: var(--transition-smooth);
        }

        .timeline-row:hover .timeline-bullet {
          background-color: var(--brand-primary);
          transform: scale(1.2);
        }

        .timeline-tasks-col {
          flex: 1;
          padding-left: 1.25rem;
          padding-bottom: 1.25rem;
        }

        .timeline-tasks-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .timeline-empty-slot {
          display: flex;
          align-items: center;
          height: 100%;
          min-height: 38px;
        }

        .quick-add-timeline-btn {
          font-family: var(--font-sans);
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: transparent;
          border: 1px dashed transparent;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 500;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          transition: var(--transition-smooth);
          width: 100%;
          text-align: left;
        }

        .quick-add-timeline-btn:hover {
          border-color: var(--border-color);
          background-color: white;
          color: var(--brand-primary);
          padding-left: 0.75rem;
        }

        /* Checkbox design inside card */
        .timeline-checkbox {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid var(--border-color);
          background-color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: var(--transition-smooth);
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .timeline-checkbox:hover {
          border-color: var(--brand-primary);
          background-color: var(--brand-primary-light);
        }

        .timeline-checkbox.checked {
          background-color: var(--accent-success);
          border-color: var(--accent-success);
        }

        .task-check-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          flex: 1;
        }

        .task-title-group {
          display: flex;
          flex-direction: column;
        }

        .task-notes-preview {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 0.15rem;
          line-height: 1.4;
        }

        .task-actions-row {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          opacity: 0;
          transition: var(--transition-smooth);
        }

        .task-card:hover .task-actions-row {
          opacity: 1;
        }

        .action-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
        }

        .action-btn:hover {
          background-color: var(--bg-primary);
          color: var(--text-primary);
        }

        .action-btn.delete:hover {
          background-color: #fee2e2;
          color: #ef4444;
        }

        .task-cat-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background-color: #f1f5f9;
          padding: 0.15rem 0.5rem;
          border-radius: 9999px;
          border: 1px solid var(--border-color);
        }

        .cat-icon {
          color: var(--text-secondary);
        }

        /* Quick Skip Switcher styles */
        .quick-status-container {
          margin-left: auto;
          display: flex;
          align-items: center;
        }

        .status-toggle-dot {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          transition: var(--transition-smooth);
        }

        .status-toggle-dot:hover {
          background-color: #f1f5f9;
        }

        .status-toggle-dot.skip:hover {
          color: #ef4444;
          background-color: #fee2e2;
        }

        .status-toggle-dot.restore:hover {
          color: var(--brand-primary);
          background-color: var(--brand-primary-light);
        }
      `}</style>
    </div>
  );
}
