import { Task } from './storage';

export function getTodayCompletes(tasks: Task[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  return tasks.filter((task) => {
    if (!task.doneAt) return false;
    return task.doneAt >= todayTimestamp;
  }).length;
}

export function getQuadrantLabel(x: number, y: number): string {
  // x: importance (0 left low, 1 right high)
  // y: urgency (0 top high, 1 bottom low) — inverted visually for intuitive drag
  const important = x >= 0.5;
  const urgent = y <= 0.5;
  
  if (important && urgent) return "Do Now"; // Q1
  if (important && !urgent) return "Plan"; // Q2
  if (!important && urgent) return "Delegate"; // Q3
  return "Eliminate"; // Q4
}
