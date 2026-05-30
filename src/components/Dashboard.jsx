import React from 'react';
import { 
  CheckSquare, 
  Clock, 
  Compass, 
  Hourglass,
  CalendarDays,
  Plus,
  Sparkles
} from 'lucide-react';
import TaskTimeline from './TaskTimeline';
import ProductivityCharts from './ProductivityCharts';

export default function Dashboard({ 
  tasks = [], 
  allTasks = {},
  selectedDate, 
  score, 
  plannedHours, 
  focusedHours, 
  targetHours,
  onAddTaskClick, 
  onEditTaskClick, 
  onDeleteTask, 
  onToggleStatus,
  onCopyTasksToNextDay
}) {
  
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const totalTasksCount = tasks.length;
  
  // Calculate completion percentage for the metrics bar
  const completionPercentage = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0;

  // Calculate focused hours percentage of target goal
  const focusGoalPercentage = Math.min(100, Math.round((focusedHours / targetHours) * 100));

  return (
    <div className="dashboard-layout-root">
      
      {/* 1. E-Commerce KPI Metric Ribbon */}
      <section className="metrics-row">
        
        {/* Metric 1: Productivity Score */}
        <div className="kpi-card score">
          <div>
            <span className="kpi-label">Productivity Rating</span>
            <h3 className="kpi-value">{score}%</h3>
          </div>
          <div className="kpi-subtext">
            <Sparkles size={12} className="text-teal" />
            <span>
              {score >= 80 ? 'Exceptional focus today!' : score >= 50 ? 'Steady production speed.' : 'Kickstart your day!'}
            </span>
          </div>
        </div>

        {/* Metric 2: Completed Tasks */}
        <div className="kpi-card completed">
          <div>
            <span className="kpi-label">Deliverables Filled</span>
            <h3 className="kpi-value">{completedTasksCount} / {totalTasksCount}</h3>
          </div>
          <div>
            <div className="kpi-mini-bar">
              <div className="kpi-mini-fill" style={{ width: `${completionPercentage}%`, backgroundColor: 'var(--accent-success)' }}></div>
            </div>
            <span className="kpi-subtext">{completionPercentage}% task completion</span>
          </div>
        </div>

        {/* Metric 3: Planned Hours */}
        <div className="kpi-card hours">
          <div>
            <span className="kpi-label">Time Scheduled</span>
            <h3 className="kpi-value">{plannedHours.toFixed(1)}h</h3>
          </div>
          <span className="kpi-subtext">
            <Clock size={12} style={{ color: '#6366f1' }} />
            <span>Total allocated blocks</span>
          </span>
        </div>

        {/* Metric 4: Focused Hours vs Target Goal */}
        <div className="kpi-card focus">
          <div>
            <span className="kpi-label">Focused Output</span>
            <h3 className="kpi-value">{focusedHours.toFixed(1)}h</h3>
          </div>
          <div>
            <div className="kpi-mini-bar">
              <div className="kpi-mini-fill" style={{ width: `${focusGoalPercentage}%`, backgroundColor: '#3b82f6' }}></div>
            </div>
            <span className="kpi-subtext">
              <Compass size={12} style={{ color: '#3b82f6' }} />
              <span>{focusGoalPercentage}% of {targetHours}h daily target</span>
            </span>
          </div>
        </div>

      </section>

      {/* 2. Responsive Core Panel Grid */}
      <section className="dashboard-grid">
        
        {/* Left Side: Daily Timeline Calendar planner */}
        <div className="panel timeline-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <CalendarDays size={18} className="text-teal" />
              <span>Daily Planner</span>
            </h3>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {totalTasksCount > 0 && onCopyTasksToNextDay && (
                <button 
                  onClick={onCopyTasksToNextDay} 
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: '9999px' }}
                  title="Copy today's list to tomorrow in advance"
                >
                  <span>Copy to Tomorrow</span>
                </button>
              )}
              
              <button 
                onClick={() => onAddTaskClick(9)} // Default new task starts at 9:00 AM
                className="btn btn-primary btn-sm btn-icon-round"
                title="Schedule new task block"
              >
                <Plus size={15} />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          <div className="timeline-scroller">
            {totalTasksCount > 0 ? (
              <TaskTimeline 
                tasks={tasks}
                onAddTaskClick={onAddTaskClick}
                onEditTaskClick={onEditTaskClick}
                onDeleteTask={onDeleteTask}
                onToggleStatus={onToggleStatus}
              />
            ) : (
              <div className="timeline-empty-state-card">
                <Hourglass size={48} className="empty-state-icon" />
                <h4>No Tasks Scheduled Today</h4>
                <p>Add focus segments to begin measuring daily velocity and scoring metrics.</p>
                <button onClick={() => onAddTaskClick(9)} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  <Plus size={14} />
                  <span>Schedule First Task</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Charts Analytics Overview */}
        <div className="dashboard-charts-column">
          <div className="panel quick-stats-wheel-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <Sparkles size={16} className="text-teal" />
                <span>Today's Efficiency Rating</span>
              </h3>
            </div>
            
            <div className="dashboard-wheel-content">
              <div className="score-circle-container">
                <div className="score-circle" style={{ '--percentage': score }}>
                  <span className="score-circle-value">{score}</span>
                  <span className="score-circle-label">Rating</span>
                </div>
              </div>

              <div className="wheel-sub-legend">
                <div className="legend-metric">
                  <div className="metric-box">
                    <span className="number">{completedTasksCount}</span>
                    <span className="label">Done</span>
                  </div>
                  <div className="metric-box">
                    <span className="number">{totalTasksCount - completedTasksCount}</span>
                    <span className="label">Left</span>
                  </div>
                  <div className="metric-box">
                    <span className="number">{focusedHours.toFixed(1)}h</span>
                    <span className="label">Focus</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick inline list of Productivity Analytics */}
          <ProductivityCharts allTasks={allTasks} selectedDate={selectedDate} />
        </div>

      </section>

      <style>{`
        .dashboard-layout-root {
          display: flex;
          flex-direction: column;
        }

        .btn-sm {
          padding: 0.35rem 0.75rem;
          font-size: 0.8rem;
          border-radius: 6px;
        }

        .btn-icon-round {
          border-radius: 9999px;
        }

        .kpi-mini-bar {
          background-color: #e2e8f0;
          height: 3px;
          border-radius: 1.5px;
          width: 100%;
          overflow: hidden;
          margin-top: 0.35rem;
          margin-bottom: 0.15rem;
        }

        .kpi-mini-fill {
          height: 100%;
          border-radius: 1.5px;
        }

        .timeline-scroller {
          max-height: 75vh;
          overflow-y: auto;
          padding-right: 0.25rem;
        }

        .dashboard-charts-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .quick-stats-wheel-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 1.5rem;
        }

        .dashboard-wheel-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .dashboard-wheel-content {
            flex-direction: row;
            justify-content: space-around;
            padding: 0 1rem;
          }
        }

        .wheel-sub-legend {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .legend-metric {
          display: flex;
          gap: 1rem;
        }

        .metric-box {
          display: flex;
          flex-direction: column;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.5rem 0.75rem;
          min-width: 68px;
          align-items: center;
        }

        .metric-box .number {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .metric-box .label {
          font-size: 0.65rem;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 700;
        }

        .timeline-empty-state-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 4rem 2rem;
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-muted);
        }

        .empty-state-icon {
          color: var(--text-muted);
          margin-bottom: 1rem;
          animation: spin-slow 8s infinite linear;
        }

        .timeline-empty-state-card h4 {
          font-family: var(--font-display);
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }

        .timeline-empty-state-card p {
          font-size: 0.8rem;
          max-width: 280px;
          line-height: 1.4;
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
