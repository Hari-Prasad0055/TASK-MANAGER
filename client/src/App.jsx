import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TaskTimeline from './components/TaskTimeline';
import ProductivityCharts from './components/ProductivityCharts';
import CategoryManager from './components/CategoryManager';
import Settings from './components/Settings';
import TaskForm from './components/TaskForm';
import Auth from './components/Auth';
import { api } from './utils/api';
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
  // --- Auth & Session State ---
  const [token, setToken] = useState(() => localStorage.getItem('prodmarket_token') || null);
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem('prodmarket_guest') === 'true');
  const [authLoading, setAuthLoading] = useState(true);

  // --- Core Application States ---
  const [tasks, setTasks] = useState({});
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [targetHours, setTargetHours] = useState(6.0);
  const [selectedDate, setSelectedDate] = useState(() => formatDateStr(new Date()));
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('dashboard');
  
  // Modal controllers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // --- Session Verification and Initial Loading ---
  useEffect(() => {
    const initAuthAndLoad = async () => {
      setAuthLoading(true);
      if (token) {
        try {
          const profile = await api.getUserProfile(token);
          setUser(profile);
          setTargetHours(profile.targetHours);
          setCategories(profile.categories);
          
          // Fetch backend tasks
          const backendTasks = await api.fetchTasks(token);
          const dict = {};
          backendTasks.forEach(task => {
            if (!dict[task.date]) {
              dict[task.date] = [];
            }
            dict[task.date].push(task);
          });
          setTasks(dict);
        } catch (e) {
          console.error('Failed to restore user session:', e);
          setToken(null);
          localStorage.removeItem('prodmarket_token');
        }
      } else {
        // Fallback to localStorage if guest or offline
        const cachedTasks = localStorage.getItem('prodmarket_tasks');
        if (cachedTasks) {
          try {
            setTasks(JSON.parse(cachedTasks));
          } catch (e) {
            setTasks(generateMockTasks());
          }
        } else {
          const mock = generateMockTasks();
          localStorage.setItem('prodmarket_tasks', JSON.stringify(mock));
          setTasks(mock);
        }

        const cachedCats = localStorage.getItem('prodmarket_categories');
        if (cachedCats) {
          try {
            setCategories(JSON.parse(cachedCats));
          } catch (e) {}
        }

        const cachedHours = localStorage.getItem('prodmarket_target_hours');
        if (cachedHours) {
          setTargetHours(parseFloat(cachedHours));
        }
      }
      setAuthLoading(false);
    };

    initAuthAndLoad();
  }, [token]);

  // Sync to local storage only if guest/offline
  useEffect(() => {
    if (!token) {
      localStorage.setItem('prodmarket_tasks', JSON.stringify(tasks));
    }
  }, [tasks, token]);

  useEffect(() => {
    if (!token) {
      localStorage.setItem('prodmarket_categories', JSON.stringify(categories));
    }
  }, [categories, token]);

  useEffect(() => {
    if (!token) {
      localStorage.setItem('prodmarket_target_hours', targetHours.toString());
    }
  }, [targetHours, token]);

  // --- Auth Handlers ---
  const handleAuthSuccess = async (newToken, userData) => {
    localStorage.setItem('prodmarket_token', newToken);
    localStorage.removeItem('prodmarket_guest');
    
    // Completely wipe all offline guest/mock data from localStorage on login
    localStorage.removeItem('prodmarket_tasks');
    localStorage.removeItem('prodmarket_categories');
    localStorage.removeItem('prodmarket_target_hours');

    setIsGuest(false);
    setToken(newToken);
    setUser(userData);
    setTargetHours(userData.targetHours);
    setCategories(userData.categories);

    // Fetch fresh backend tasks directly from MongoDB
    try {
      const backendTasks = await api.fetchTasks(newToken);
      const dict = {};
      backendTasks.forEach(task => {
        if (!dict[task.date]) {
          dict[task.date] = [];
        }
        dict[task.date].push(task);
      });
      setTasks(dict);
    } catch (e) {
      console.error('Failed to load tasks after login:', e);
      setTasks({}); // Start fresh if loading fails, preventing leakage of other session data
    }
  };

  const handleGuestLogin = () => {
    localStorage.setItem('prodmarket_guest', 'true');
    setIsGuest(true);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('prodmarket_token');
      localStorage.removeItem('prodmarket_guest');
      
      // Wipe all localStorage states to ensure a completely clean slate
      localStorage.removeItem('prodmarket_tasks');
      localStorage.removeItem('prodmarket_categories');
      localStorage.removeItem('prodmarket_target_hours');

      setToken(null);
      setUser(null);
      setIsGuest(false);
      setTasks({});
      setCategories(DEFAULT_CATEGORIES);
      setTargetHours(6.0);
    }
  };

  // --- Data Sync Handlers ---
  const handleUpdateTargetHours = async (newHours) => {
    setTargetHours(newHours);
    if (token) {
      try {
        await api.updateSettings(token, { targetHours: newHours });
      } catch (e) {
        console.error('Failed to update target hours on backend:', e);
      }
    }
  };

  const todaysTasks = tasks[selectedDate] || [];

  const getFilteredTasks = (taskList) => {
    if (!searchQuery.trim()) return taskList;
    const query = searchQuery.toLowerCase().trim();
    return taskList.filter(
      (t) => t.title.toLowerCase().includes(query) || t.category.toLowerCase().includes(query)
    );
  };

  const activeFilteredTasks = getFilteredTasks(todaysTasks);
  const score = calculateDailyScore(activeFilteredTasks);
  const plannedHours = calculatePlannedHours(activeFilteredTasks);
  const focusedHours = calculateFocusedHours(activeFilteredTasks);

  // --- CRUD Handlers ---
  const handleToggleStatus = async (taskId, newStatus) => {
    let updatedTask = null;

    setTasks((prev) => {
      const dayTasks = prev[selectedDate] || [];
      const updated = dayTasks.map((t) => {
        if (t.id === taskId) {
          updatedTask = { ...t, status: newStatus };
          return updatedTask;
        }
        return t;
      });
      return {
        ...prev,
        [selectedDate]: updated
      };
    });

    if (token && updatedTask) {
      try {
        await api.saveTask(token, updatedTask);
      } catch (e) {
        console.error('Failed to sync status change to backend:', e);
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task block from today\'s schedule?')) {
      setTasks((prev) => {
        const dayTasks = prev[selectedDate] || [];
        const updated = dayTasks.filter((t) => t.id !== taskId);
        return {
          ...prev,
          [selectedDate]: updated
        };
      });

      if (token) {
        try {
          await api.deleteTask(token, taskId);
        } catch (e) {
          console.error('Failed to delete task from backend:', e);
        }
      }
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
    setIsFormOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    const dateKey = taskData.date || selectedDate;
    const dayTasks = tasks[dateKey] || [];
    let finalTask;

    const exists = dayTasks.some((t) => t.id === taskData.id);
    if (exists) {
      finalTask = taskData;
    } else {
      finalTask = {
        ...taskData,
        id: taskData.id || `task-${Date.now()}`,
        date: dateKey
      };
    }

    setTasks((prev) => {
      const dayTasks = prev[dateKey] || [];
      let updated;
      const exists = dayTasks.some((t) => t.id === finalTask.id);
      if (exists) {
        updated = dayTasks.map((t) => (t.id === finalTask.id ? finalTask : t));
      } else {
        updated = [...dayTasks, finalTask];
      }

      updated.sort((a, b) => {
        const parseTime = (str) => str.split(':').map(Number)[0] + str.split(':').map(Number)[1]/60;
        return parseTime(a.startTime) - parseTime(b.startTime);
      });

      return {
        ...prev,
        [dateKey]: updated
      };
    });

    if (token) {
      try {
        await api.saveTask(token, finalTask);
      } catch (e) {
        console.error('Failed to save task to backend:', e);
      }
    }

    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleAddCategory = async (newCat) => {
    const updated = [...categories, newCat];
    setCategories(updated);

    if (token) {
      try {
        await api.updateSettings(token, { categories: updated });
      } catch (e) {
        console.error('Failed to save category to backend:', e);
      }
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (window.confirm('Delete this custom category? (Existing tasks will remain unaltered)')) {
      const updated = categories.filter((c) => c.id !== catId);
      setCategories(updated);

      if (token) {
        try {
          await api.updateSettings(token, { categories: updated });
        } catch (e) {
          console.error('Failed to delete category from backend:', e);
        }
      }
    }
  };

  const handleCopyTasksToNextDay = async () => {
    if (todaysTasks.length === 0) {
      alert('No tasks planned for the selected date to copy.');
      return;
    }

    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = formatDateStr(nextDate);
    const friendlyNextDate = nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (window.confirm(`Copy all ${todaysTasks.length} tasks from this day to tomorrow (${friendlyNextDate}) in advance?`)) {
      const nextDayExistingTasks = tasks[nextDateStr] || [];
      
      const clonedTasks = todaysTasks.map((t, index) => ({
        ...t,
        id: `task-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
        status: 'pending',
        date: nextDateStr
      }));

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

      mergedTasks.sort((a, b) => {
        const parseTime = (str) => str.split(':').map(Number)[0] + str.split(':').map(Number)[1]/60;
        return parseTime(a.startTime) - parseTime(b.startTime);
      });

      setTasks((prev) => ({
        ...prev,
        [nextDateStr]: mergedTasks
      }));

      if (token) {
        try {
          const addedClonedTasks = clonedTasks.filter(
            (cloned) => !nextDayExistingTasks.some(
              (existing) => 
                existing.title.toLowerCase() === cloned.title.toLowerCase() && 
                existing.startTime === cloned.startTime
            )
          );
          if (addedClonedTasks.length > 0) {
            await api.syncTasks(token, addedClonedTasks);
          }
        } catch (e) {
          console.error('Failed to sync copied tasks to backend:', e);
        }
      }

      alert(`Successfully copied ${todaysTasks.length} tasks to ${friendlyNextDate}!`);
    }
  };

  const handleLoadMockData = async () => {
    const mock = generateMockTasks();
    setTasks(mock);

    if (token) {
      try {
        const flatMock = Object.values(mock).flat();
        await api.syncTasks(token, flatMock);
      } catch (e) {
        console.error('Failed to save mock data to backend:', e);
      }
    }
  };

  const handleClearAllData = async () => {
    setTasks({});

    if (token) {
      try {
        await api.purgeAllTasks(token);
      } catch (e) {
        console.error('Failed to purge tasks on backend:', e);
      }
    }
  };

  const handleExportData = () => {
    return JSON.stringify(tasks, null, 2);
  };

  const handleImportData = async (jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (typeof parsed === 'object' && parsed !== null) {
        setTasks(parsed);

        if (token) {
          const flatTasks = Object.values(parsed).flat();
          await api.syncTasks(token, flatTasks);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', backgroundColor: 'var(--bg-primary)' }}>
        <div className="auth-spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!token && !isGuest) {
    return (
      <Auth 
        onAuthSuccess={handleAuthSuccess} 
        onGuestLogin={handleGuestLogin} 
      />
    );
  }

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
            setTargetHours={handleUpdateTargetHours}
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
        user={user}
        onLogout={handleLogout}
      />

      {/* 2. Right Workspace Content Pane */}
      <main className="main-content">
        <Header 
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          score={score}
          user={user}
          onLogout={handleLogout}
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
