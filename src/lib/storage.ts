import { z } from 'zod';

// Task schema with zod validation
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  impact: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  doneAt: z.number().nullable().optional(),
});

export type Task = z.infer<typeof TaskSchema>;

// Storage schema for versioning and migrations
const StorageSchema = z.object({
  version: z.string(),
  tasks: z.array(TaskSchema),
});

type StorageData = z.infer<typeof StorageSchema>;

const STORAGE_KEY = 'ebb_v1';
const CURRENT_VERSION = 'ebb_v1';

export function loadTasks(): Task[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const data = JSON.parse(raw);
    const validated = StorageSchema.parse(data);
    
    // Future: Add migration logic here based on version
    return validated.tasks;
  } catch (error) {
    console.warn('Failed to load tasks from localStorage:', error);
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Cap to 200 tasks as per requirements
    const cappedTasks = tasks.slice(0, 200);
    
    const data: StorageData = {
      version: CURRENT_VERSION,
      tasks: cappedTasks,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
  }
}

export function exportTasks(tasks: Task[]): string {
  const data: StorageData = {
    version: CURRENT_VERSION,
    tasks,
  };
  return JSON.stringify(data, null, 2);
}

export function importTasks(jsonString: string): Task[] {
  try {
    const data = JSON.parse(jsonString);
    const validated = StorageSchema.parse(data);
    return validated.tasks;
  } catch (error) {
    throw new Error('Invalid task data format');
  }
}
