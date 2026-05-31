import React, { useState } from 'react';
import { FolderKanban, Plus, Clock, Award, Trash2 } from 'lucide-react';

export default function CategoryManager({ categories, onAddCategory, onDeleteCategory, allTasks }) {
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366f1'); // default indigo
  const [error, setError] = useState('');

  // Sample swatches for custom category colors
  const swatches = [
    '#6366f1', // Indigo
    '#0ea5e9', // Sky
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#8b5cf6', // Violet
    '#ef4444', // Rose
    '#14b8a6', // Teal
    '#22c55e', // Green
    '#f43f5e'  // Rose dark
  ];

  // Aggregate stats per category (across all 30 days)
  const getCategoryStats = (catName) => {
    let taskCount = 0;
    let completedCount = 0;
    let totalHours = 0;

    Object.values(allTasks).flat().forEach((t) => {
      if (t.category.toLowerCase() === catName.toLowerCase()) {
        taskCount++;
        if (t.status === 'completed') {
          completedCount++;
          const duration = Math.max(0.25, (t.endTime.split(':').map(Number)[0] + t.endTime.split(':').map(Number)[1]/60) - 
                                       (t.startTime.split(':').map(Number)[0] + t.startTime.split(':').map(Number)[1]/60));
          totalHours += duration;
        }
      }
    });

    return {
      taskCount,
      completedCount,
      totalHours: parseFloat(totalHours.toFixed(1))
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!newCatName.trim()) {
      setError('Category name is required.');
      return;
    }

    if (categories.some((c) => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
      setError('A category with this name already exists.');
      return;
    }

    onAddCategory({
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      color: newCatColor
    });

    setNewCatName('');
  };

  return (
    <div className="category-pane">
      <div className="panel-header">
        <h2 className="panel-title">
          <FolderKanban size={18} className="text-teal" />
          <span>Category Hub</span>
        </h2>
        <span className="panel-subtitle">Total Focus Fields</span>
      </div>

      <div className="cat-grid-layout">
        
        {/* Left Column: List existing categories */}
        <div className="categories-list-col">
          <div className="cat-grid">
            {categories.map((cat) => {
              const stats = getCategoryStats(cat.name);
              const isDefault = ['deep work', 'coding', 'meetings', 'health & sport', 'administrative', 'personal growth'].includes(cat.name.toLowerCase());
              
              return (
                <div 
                  key={cat.id} 
                  className="cat-card"
                  style={{ '--cat-theme': cat.color }}
                >
                  <div className="cat-card-header">
                    <div className="cat-title-group">
                      <span className="cat-bullet" style={{ backgroundColor: cat.color }}></span>
                      <h4 className="cat-name">{cat.name}</h4>
                    </div>

                    {!isDefault && (
                      <button 
                        onClick={() => onDeleteCategory(cat.id)}
                        className="cat-delete-btn"
                        title="Delete Custom Category"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <div className="cat-card-body">
                    <div className="cat-stat-item">
                      <Clock size={12} className="stat-icon" />
                      <span className="stat-label">Focused Time:</span>
                      <span className="stat-val">{stats.totalHours} hrs</span>
                    </div>

                    <div className="cat-stat-item">
                      <Award size={12} className="stat-icon" />
                      <span className="stat-label">Tasks Completed:</span>
                      <span className="stat-val">{stats.completedCount} / {stats.taskCount}</span>
                    </div>
                  </div>

                  <div className="cat-card-progress">
                    <div 
                      className="cat-card-progress-fill" 
                      style={{ 
                        width: `${stats.taskCount > 0 ? (stats.completedCount / stats.taskCount) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Add custom form */}
        <div className="panel cat-form-panel">
          <h3 className="cat-form-title">
            <Plus size={16} />
            <span>Create Custom Category</span>
          </h3>

          {error && <div className="validation-alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Category Name</label>
              <input
                type="text"
                placeholder="e.g., Side Hustle, Design Review..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="form-input"
                maxLength={20}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Theme Color Swatch</label>
              <div className="swatch-grid">
                {swatches.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCatColor(color)}
                    className={`swatch-btn ${newCatColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="swatch-preview-bar">
              <span className="form-label">Selected Preview:</span>
              <div className="preview-capsule" style={{ backgroundColor: newCatColor }}>
                <span className="preview-bullet" style={{ backgroundColor: '#ffffff' }}></span>
                <span className="preview-text">{newCatName || 'Category Name'}</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem' }}>
              Add to Focus Inventory
            </button>
          </form>
        </div>

      </div>

      <style>{`
        .category-pane {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .cat-grid-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 1024px) {
          .cat-grid-layout {
            grid-template-columns: 1.6fr 1fr;
          }
        }

        .cat-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .cat-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .cat-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          box-shadow: var(--shadow-sm);
          transition: var(--transition-smooth);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .cat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--cat-theme);
        }

        .cat-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid rgba(0,0,0,0.03);
          padding-bottom: 0.5rem;
        }

        .cat-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .cat-bullet {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }

        .cat-name {
          font-family: var(--font-display);
          font-size: 0.95rem;
          color: var(--text-primary);
          font-weight: 700;
        }

        .cat-delete-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          width: 22px;
          height: 22px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
        }

        .cat-delete-btn:hover {
          background-color: #fee2e2;
          color: #ef4444;
        }

        .cat-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin-bottom: 1rem;
        }

        .cat-stat-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .stat-icon {
          color: var(--text-muted);
        }

        .stat-label {
          color: var(--text-secondary);
          flex: 1;
        }

        .stat-val {
          font-weight: 700;
          color: var(--text-primary);
        }

        .cat-card-progress {
          height: 3px;
          width: 100%;
          background-color: #cbd5e1;
          border-radius: 1.5px;
          overflow: hidden;
        }

        .cat-card-progress-fill {
          height: 100%;
          background-color: var(--cat-theme);
          border-radius: 1.5px;
        }

        /* Form styling */
        .cat-form-panel {
          height: fit-content;
        }

        .cat-form-title {
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }

        .swatch-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.5rem;
        }

        .swatch-btn {
          width: 100%;
          aspect-ratio: 1;
          border-radius: var(--radius-sm);
          border: 2px solid transparent;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .swatch-btn:hover {
          transform: scale(1.1);
        }

        .swatch-btn.active {
          border-color: #0f172a;
          box-shadow: 0 0 0 2px white inset;
        }

        .swatch-preview-bar {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin-bottom: 1rem;
          background-color: var(--bg-primary);
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .preview-capsule {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          width: fit-content;
        }

        .preview-bullet {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .w-full {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
