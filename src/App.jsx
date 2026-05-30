import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TaskTimeline from './components/TaskTimeline';
import ProductivityCharts from './components/ProductivityCharts';
import CategoryManager from './components/CategoryManager';
import Settings from './components/Settings';
import TaskForm from './components/TaskForm';
import { 
  calculateDailyScore, 
  calculatePlannedHours, 
  calculateFocusedHours, 
  generateMockTasks, 
  formatDateStr,
  DEFAULT_CATEGORIES 
} from './utils/productivity';
import { 
  CalendarDays, 
  BarChart3, 
  TrendingUp, 
  FolderKanban, 
  Settings as SettingsIcon,
  Plus
} from 'lucide-react';

export default function App() {
  
  // 1. Initial State Hydration from Local Storage
  const [tasks, setTasks] = useState(() => {
    const local = localStorage.getItem('prodmarket_tasks');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse cached tasks, reloading mock database.', e);
      }
    }
    // If empty, generate and seed mock data
    const mock = generateMockTasks();
    localStorage.setItem('prodmarket_tasks', JSON.stringify(mock));
    return mock;
  });

  const [categories, setCategories] = useState(() => {
    const local = localStorage.getItem('prodmarket_categories');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    }
    return DEFAULT_CATEGORIES;
  });

  const [targetHours, setTargetHours] = useState(() => {
    const local = localStorage.getItem('prodmarket_target_hours');
    return local ? parseFloat(local) : 6.0; // default 6 hours
  });

  // Selected date defaults to current calendar day formatted as YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(() => formatDateStr(new Date()));
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('dashboard');
  
  // Modal controllers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Sync to local storage on changes
  useEffect(() => {
    localStorage.setItem('prodmarket_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('prodmarket_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('prodmarket_target_hours', targetHours.toString());
  }, [targetHours]);

  // Derived tasks lists
  const todaysTasks = tasks[selectedDate] || [];

  // Filter tasks based on search bar queries (filters title or category matching)
  const getFilteredTasks = (taskList) => {
    if (!searchQuery.trim()) return taskList;
    const query = searchQuery.toLowerCase().trim();
    return taskList.filter(
      (t) => t.title.toLowerCase().includes(query) || t.category.toLowerCase().includes(query)
    );
  };

  const activeFilteredTasks = getFilteredTasks(todaysTasks);

  // Today's Score & Duration metrics
  const score = calculateDailyScore(activeFilteredTasks);
  const plannedHours = calculatePlannedHours(activeFilteredTasks);
  const focusedHours = calculateFocusedHours(activeFilteredTasks);

  // Handlers for interactive checklist controls
  const handleToggleStatus = (taskId, newStatus) => {
    setTasks((prev) => {
      const dayTasks = prev[selectedDate] || [];
      const updated = dayTasks.map((t) => 
        t.id === taskId ? { ...t, status: newStatus } : t
      );
      return {
        ...prev,
        [selectedDate]: updated
      };
    });
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Delete this task block from today\'s schedule?')) {
      setTasks((prev) => {
        const dayTasks = prev[selectedDate] || [];
        const updated = dayTasks.filter((t) => t.id !== taskId);
        return {
          ...prev,
          [selectedDate]: updated
        };
      });
    }
  };

  const handleEditTaskClick = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleAddTaskClick = (defaultHour) => {
    const pad = (n) => n.toString().padStart(2, '0');
    const startStr = `${pad(defaultHour)}:00`;
    const endStr = `${pad(defaultHour + 1)}:00`;

    setEditingTask({
      title: '',
      category: categories[0]?.name || 'Deep Work',
      priority: 'medium',
      startTime: startStr,
      endTime: endStr,
      status: 'pending',
      notes: '',
      date: selectedDate
    });
    // Setting editingTask to template format, but flag it as new task by nulling id
    setEditingTask(prev => ({ ...prev, id: undefined }));
    setIsFormOpen(true);
  };

  const handleSaveTask = (taskData) => {
    setTasks((prev) => {
      const dateKey = taskData.date || selectedDate;
      const dayTasks = prev[dateKey] || [];
      let updated;

      // Check if task exists (editing) or is new
      const exists = dayTasks.some((t) => t.id === taskData.id);
      if (exists) {
        updated = dayTasks.map((t) => (t.id === taskData.id ? taskData : t));
      } else {
        // Assign new ID if not present
        const finalTask = {
          ...taskData,
          id: taskData.id || `task-${Date.now()}`,
          date: dateKey
        };
        updated = [...dayTasks, finalTask];
      }

      // Re-sort chronologically
      updated.sort((a, b) => {
        const parseTime = (str) => str.split(':').map(Number)[0] + str.split(':').map(Number)[1]/60;
        return parseTime(a.startTime) - parseTime(b.startTime);
      });

      return {
        ...prev,
        [dateKey]: updated
      };
    });

    setIsFormOpen(false);
    setEditingTask(null);
  };

  // Category manipulations
  const handleAddCategory = (newCat) => {
    setCategories((prev) => [...prev, newCat]);
  };

  const handleDeleteCategory = (catId) => {
    if (window.confirm('Delete this custom category? (Existing tasks will remain unaltered)')) {
      setCategories((prev) => prev.filter((c) => c.id !== catId));
    }
  };

  // Clone today's planner tasks to tomorrow in advance
  const handleCopyTasksToNextDay = () => {
    if (todaysTasks.length === 0) {
      alert('No tasks planned for the selected date to copy.');
      return;
    }

    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = formatDateStr(nextDate);

    const friendlyNextDate = nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (window.confirm(`Copy all ${todaysTasks.length} tasks from this day to tomorrow (${friendlyNextDate}) in advance?`)) {
      setTasks((prev) => {
        const nextDayExistingTasks = prev[nextDateStr] || [];
        
        // Clone and map: fresh unique IDs, reset status to 'pending', update date
        const clonedTasks = todaysTasks.map((t, index) => ({
          ...t,
          id: `task-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
          status: 'pending',
          date: nextDateStr
        }));

        // Merge cloned tasks avoiding exact name & start time duplicates
        const mergedTasks = [...nextDayExistingTasks];
        clonedTasks.forEach((cloned) => {
          const duplicateExists = nextDayExistingTasks.some(
            (existing) => 
              existing.title.toLowerCase() === cloned.title.toLowerCase() && 
              existing.startTime === cloned.startTime
          );
          if (!duplicateExists) {
            mergedTasks.push(cloned);
          }
        });

        // Sort chronologically
        mergedTasks.sort((a, b) => {
          const parseTime = (str) => str.split(':').map(Number)[0] + str.split(':').map(Number)[1]/60;
          return parseTime(a.startTime) - parseTime(b.startTime);
        });

        return {
          ...prev,
          [nextDateStr]: mergedTasks
        };
      });

      alert(`Successfully copied ${todaysTasks.length} tasks to ${friendlyNextDate}!`);
    }
  };

  // Settings & DB backup controls
  const handleLoadMockData = () => {
    const mock = generateMockTasks();
    setTasks(mock);
  };

  const handleClearAllData = () => {
    setTasks({});
  };

  const handleExportData = () => {
    return JSON.stringify(tasks, null, 2);
  };

  const handleImportData = (jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      // Validate simple schema checks
      if (typeof parsed === 'object' && parsed !== null) {
        setTasks(parsed);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Primary Workspace router mapping
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            tasks={activeFilteredTasks}
            allTasks={tasks}
            selectedDate={selectedDate}
            score={score}
            plannedHours={plannedHours}
            focusedHours={focusedHours}
            targetHours={targetHours}
            onAddTaskClick={handleAddTaskClick}
            onEditTaskClick={handleEditTaskClick}
            onDeleteTask={handleDeleteTask}
            onToggleStatus={handleToggleStatus}
            onCopyTasksToNextDay={handleCopyTasksToNextDay}
          />
        );
      case 'today':
        return (
          <div className="panel flex-col-panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <CalendarDays size={18} className="text-teal" />
                <span>Focus Roadmap Scheduler</span>
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {todaysTasks.length > 0 && (
                  <button 
                    onClick={handleCopyTasksToNextDay} 
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: '9999px' }}
                    title="Copy today's list to tomorrow in advance"
                  >
                    <span>Copy to Tomorrow</span>
                  </button>
                )}
                <button onClick={() => handleAddTaskClick(9)} className="btn btn-primary">
                  <Plus size={14} />
                  <span>Add Task</span>
                </button>
              </div>
            </div>
            
            <TaskTimeline 
              tasks={activeFilteredTasks}
              onAddTaskClick={handleAddTaskClick}
              onEditTaskClick={handleEditTaskClick}
              onDeleteTask={handleDeleteTask}
              onToggleStatus={handleToggleStatus}
            />
          </div>
        );
      case 'weekly':
        return (
          <div className="panel flex-col-panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <BarChart3 size={18} className="text-teal" />
                <span>Rolling Weekly Analytics & Forecasts</span>
              </h2>
            </div>
            <ProductivityCharts allTasks={tasks} selectedDate={selectedDate} />
          </div>
        );
      case 'monthly':
        return (
          <div className="panel flex-col-panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <TrendingUp size={18} className="text-teal" />
                <span>30-Day Velocity Audit Logs</span>
              </h2>
            </div>
            <ProductivityCharts allTasks={tasks} selectedDate={selectedDate} />
          </div>
        );
      case 'categories':
        return (
          <CategoryManager 
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            allTasks={tasks}
          />
        );
      case 'settings':
        return (
          <Settings 
            targetHours={targetHours}
            setTargetHours={setTargetHours}
            onLoadMockData={handleLoadMockData}
            onClearAllData={handleClearAllData}
            onExportData={handleExportData}
            onImportData={handleImportData}
          />
        );
      default:
        return <div>Tab not found.</div>;
    }
  };

  return (
    <div className="app-container">
      {/* 1. Left Nav Sidebar (Desktop collapser & bottom nav) */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
      />

      {/* 2. Right Workspace Content Pane */}
      <main className="main-content">
        <Header 
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          score={score}
        />

        <div className="content-pane">
          {renderTabContent()}
        </div>
      </main>

      {/* 3. Global Task Form Overlay Modal */}
      <TaskForm 
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        editingTask={editingTask}
        categories={categories}
      />

      <style>{`
        .flex-col-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          min-height: 80vh;
        }

        .text-teal {
          color: var(--brand-primary);
        }
      `}</style>
    </div>
  );
}
