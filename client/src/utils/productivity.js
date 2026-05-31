/**
 * Productivity Market - Analytics & Scoring Utility Engine
 */

// Helper: Convert "HH:MM" 24h string to decimal hours (e.g., "08:30" -> 8.5)
export const timeToDecimal = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + (minutes / 60);
};

// Helper: Convert decimal hours to "HH:MM" (e.g., 8.5 -> "08:30")
export const decimalToTime = (decimalVal) => {
  const hours = Math.floor(decimalVal);
  const minutes = Math.round((decimalVal - hours) * 60);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}`;
};

// Helper: Format Date object to YYYY-MM-DD
export const formatDateStr = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Calculates a premium productivity score (0-100) for a given set of tasks.
 * Algorithm:
 * - Each task has a duration: end - start
 * - Weight is applied by priority: High = 1.5, Medium = 1.0, Low = 0.7
 * - Completion factor: Completed = 1.0, In Progress = 0.5, Pending = 0, Skipped = 0
 * - Skipped tasks apply a flat penalty of -5 points per skipped task to incentivize completion.
 */
export const calculateDailyScore = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;

  let totalWeightedPlanned = 0;
  let totalWeightedCompleted = 0;
  let skippedCount = 0;

  tasks.forEach((task) => {
    const duration = Math.max(0.25, timeToDecimal(task.endTime) - timeToDecimal(task.startTime));
    
    let priorityWeight = 1.0;
    if (task.priority === 'high') priorityWeight = 1.5;
    if (task.priority === 'low') priorityWeight = 0.7;

    const weightedDuration = duration * priorityWeight;
    
    // Skipped tasks count in planned, but not completed
    totalWeightedPlanned += weightedDuration;

    let completionFactor = 0;
    if (task.status === 'completed') {
      completionFactor = 1.0;
    } else if (task.status === 'in progress') {
      completionFactor = 0.5;
    } else if (task.status === 'skipped') {
      skippedCount++;
    }

    totalWeightedCompleted += weightedDuration * completionFactor;
  });

  if (totalWeightedPlanned === 0) return 0;

  // Base score based on completion
  let score = (totalWeightedCompleted / totalWeightedPlanned) * 100;

  // Apply skipped penalty (-5 points per skipped task)
  score = score - (skippedCount * 5);

  return Math.min(100, Math.max(0, Math.round(score)));
};

// Calculate total planned hours
export const calculatePlannedHours = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  return tasks.reduce((sum, task) => {
    const duration = timeToDecimal(task.endTime) - timeToDecimal(task.startTime);
    return sum + Math.max(0, duration);
  }, 0);
};

// Calculate focused (completed task) hours
export const calculateFocusedHours = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  return tasks.reduce((sum, task) => {
    if (task.status !== 'completed' && task.status !== 'in-progress' && task.status !== 'in progress') return sum;
    const duration = timeToDecimal(task.endTime) - timeToDecimal(task.startTime);
    const factor = task.status === 'completed' ? 1.0 : 0.5;
    return sum + (Math.max(0, duration) * factor);
  }, 0);
};

// Predefined modern categories
export const DEFAULT_CATEGORIES = [
  { id: 'deep-work', name: 'Deep Work', color: 'var(--cat-work)' },
  { id: 'coding', name: 'Coding', color: 'var(--cat-coding)' },
  { id: 'meetings', name: 'Meetings', color: 'var(--cat-meeting)' },
  { id: 'health', name: 'Health & Sport', color: 'var(--cat-health)' },
  { id: 'admin', name: 'Administrative', color: 'var(--cat-admin)' },
  { id: 'personal', name: 'Personal Growth', color: 'var(--cat-personal)' }
];

// Generator: Beautiful deterministic mock tasks for the last 30 days
export const generateMockTasks = () => {
  const tasks = {};
  const today = new Date();
  
  // Predefined lists of realistic tasks to draw from deterministically
  const taskPool = [
    { title: 'Redesign Checkout Flow UI', category: 'Coding', priority: 'high', start: '08:30', end: '11:00', notes: 'Apply refined card details and soft shadows.' },
    { title: 'Morning Cardio & Meditation', category: 'Health & Sport', priority: 'medium', start: '06:30', end: '07:30', notes: 'Outdoor running. Clear head for the day.' },
    { title: 'Weekly Product Alignment', category: 'Meetings', priority: 'medium', start: '11:30', end: '12:30', notes: 'Sync with design and marketing teams.' },
    { title: 'Draft Marketing Newsletter', category: 'Deep Work', priority: 'low', start: '13:30', end: '15:00', notes: 'Write copy highlighting the custom widget releases.' },
    { title: 'Inbox Zero & Slack Cleanse', category: 'Administrative', priority: 'low', start: '17:00', end: '17:45', notes: 'Archive old channels and tag followups.' },
    { title: 'Refactor Analytics Controller', category: 'Coding', priority: 'high', start: '09:00', end: '11:30', notes: 'Optimise MongoDB aggregations.' },
    { title: 'Read Book: Atomic Habits', category: 'Personal Growth', priority: 'low', start: '16:00', end: '17:00', notes: 'Take notes on the feedback loops section.' },
    { title: 'Sprint Review & Retrospective', category: 'Meetings', priority: 'high', start: '14:00', end: '15:30', notes: 'Demo dashboard widget updates.' },
    { title: 'Healthy Meal Prep', category: 'Health & Sport', priority: 'medium', start: '12:00', end: '12:45', notes: 'Prep grilled chicken and fresh salads.' },
    { title: 'API Security Audit & Fixes', category: 'Coding', priority: 'high', start: '08:00', end: '10:30', notes: 'Add rate limiting to authentication endpoints.' }
  ];

  const statuses = ['completed', 'completed', 'completed', 'in progress', 'skipped', 'completed'];

  for (let d = 30; d >= 0; d--) {
    const targetDate = new Date();
    targetDate.setDate(today.getDate() - d);
    const dateStr = formatDateStr(targetDate);
    
    // Choose how many tasks for this day (between 3 and 5)
    // Deterministic random using day number
    const dayNum = targetDate.getDate();
    const taskCount = 3 + (dayNum % 3); // 3, 4, or 5 tasks
    
    const dayTasks = [];
    
    for (let t = 0; t < taskCount; t++) {
      // Pick a task from pool deterministically based on date & index
      const poolIndex = (dayNum * 7 + t * 3) % taskPool.length;
      const poolItem = taskPool[poolIndex];
      
      // Determine status based on index (Today has more pending/in-progress; past days are mostly completed/skipped)
      let status = 'completed';
      if (d === 0) {
        // Today has some pending / in progress
        status = t === 0 ? 'completed' : t === 1 ? 'in progress' : 'pending';
      } else {
        // Historical days are completed or skipped
        status = statuses[(dayNum + t) % statuses.length];
      }

      dayTasks.push({
        id: `mock-${dateStr}-${t}`,
        title: poolItem.title,
        category: poolItem.category,
        priority: poolItem.priority,
        startTime: poolItem.start,
        endTime: poolItem.end,
        status: status,
        notes: poolItem.notes,
        date: dateStr
      });
    }

    // Sort tasks by start time
    dayTasks.sort((a, b) => timeToDecimal(a.startTime) - timeToDecimal(b.startTime));
    tasks[dateStr] = dayTasks;
  }

  return tasks;
};
