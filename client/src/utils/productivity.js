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
  return {};
};
