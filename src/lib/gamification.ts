import { Task } from './storage';

export interface GameStats {
  streak: number;
  lastCompletionDate: string | null;
  totalCompleted: number;
  achievements: string[];
  level: number;
  xp: number;
}

const STORAGE_KEY = 'ebb_game_stats';

export function loadGameStats(): GameStats {
  if (typeof window === 'undefined') {
    return getDefaultStats();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load game stats:', error);
  }

  return getDefaultStats();
}

export function saveGameStats(stats: GameStats): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save game stats:', error);
  }
}

function getDefaultStats(): GameStats {
  return {
    streak: 0,
    lastCompletionDate: null,
    totalCompleted: 0,
    achievements: [],
    level: 1,
    xp: 0,
  };
}

export function updateStatsOnCompletion(currentStats: GameStats): GameStats {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  let newStreak = currentStats.streak;
  
  // Update streak
  if (currentStats.lastCompletionDate === today) {
    // Already completed today, keep streak
    newStreak = currentStats.streak;
  } else if (currentStats.lastCompletionDate === yesterday || currentStats.lastCompletionDate === null) {
    // Completed yesterday or first time, increment streak
    newStreak = currentStats.streak + 1;
  } else {
    // Streak broken, reset to 1
    newStreak = 1;
  }

  const newXP = currentStats.xp + 10;
  const newLevel = Math.floor(newXP / 100) + 1;
  const newTotalCompleted = currentStats.totalCompleted + 1;

  // Check for new achievements
  const newAchievements = [...currentStats.achievements];
  
  if (newStreak >= 3 && !newAchievements.includes('streak_3')) {
    newAchievements.push('streak_3');
  }
  if (newStreak >= 7 && !newAchievements.includes('streak_7')) {
    newAchievements.push('streak_7');
  }
  if (newStreak >= 30 && !newAchievements.includes('streak_30')) {
    newAchievements.push('streak_30');
  }
  if (newTotalCompleted >= 10 && !newAchievements.includes('tasks_10')) {
    newAchievements.push('tasks_10');
  }
  if (newTotalCompleted >= 50 && !newAchievements.includes('tasks_50')) {
    newAchievements.push('tasks_50');
  }
  if (newTotalCompleted >= 100 && !newAchievements.includes('tasks_100')) {
    newAchievements.push('tasks_100');
  }

  return {
    streak: newStreak,
    lastCompletionDate: today,
    totalCompleted: newTotalCompleted,
    achievements: newAchievements,
    level: newLevel,
    xp: newXP,
  };
}

export const ACHIEVEMENTS = {
  streak_3: { name: '3 Day Streak', icon: '🔥', description: 'Complete tasks 3 days in a row' },
  streak_7: { name: 'Week Warrior', icon: '⚡', description: 'Complete tasks 7 days in a row' },
  streak_30: { name: 'Month Master', icon: '👑', description: 'Complete tasks 30 days in a row' },
  tasks_10: { name: 'Getting Started', icon: '🌱', description: 'Complete 10 tasks' },
  tasks_50: { name: 'Productivity Pro', icon: '🚀', description: 'Complete 50 tasks' },
  tasks_100: { name: 'Century Club', icon: '💯', description: 'Complete 100 tasks' },
};

export function getXPForNextLevel(currentLevel: number): number {
  return currentLevel * 100;
}

export function getCurrentLevelProgress(xp: number, level: number): number {
  const xpInCurrentLevel = xp - (level - 1) * 100;
  const xpNeededForLevel = 100;
  return (xpInCurrentLevel / xpNeededForLevel) * 100;
}
