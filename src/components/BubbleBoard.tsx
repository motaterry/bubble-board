'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, loadTasks, saveTasks, exportTasks } from '@/lib/storage';
import { getTodayCompletes } from '@/lib/metrics';
import { loadGameStats, saveGameStats, updateStatsOnCompletion, GameStats } from '@/lib/gamification';
import { haptics } from '@/lib/haptics';
import AddTask from './AddTask';
import Toolbar from './Toolbar';
import Bubble from './Bubble';
import OnboardingHints from './OnboardingHints';
import HelpModal from './HelpModal';
import KeyboardShortcuts from './KeyboardShortcuts';
import GameStatsDisplay from './GameStats';
import AchievementToast from './AchievementToast';
import Confetti from './Confetti';

export default function BubbleBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasDragged, setHasDragged] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>(loadGameStats());
  const [newAchievement, setNewAchievement] = useState<string | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [confettiPosition, setConfettiPosition] = useState({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement | null>(null);

  // Load tasks on mount
  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      saveTasks(tasks);
    }
  }, [tasks]);

  const addTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).slice(2, 9),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (id: string, patch: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleTaskMove = (id: string, x: number, y: number) => {
    setHasDragged(true);
    updateTask(id, { x, y });
  };

  const handleTaskClick = (id: string, e: React.MouseEvent) => {
    if (e.altKey) {
      haptics.medium();
      removeTask(id);
    } else {
      const task = tasks.find(t => t.id === id);
      if (task) {
        const wasCompleted = Boolean(task.doneAt);
        updateTask(id, { doneAt: wasCompleted ? null : Date.now() });
        if (!wasCompleted) {
          // Task completed! Trigger celebration
          haptics.success();
          setHasCompleted(true);
          
          // Update game stats
          const oldAchievements = gameStats.achievements;
          const newStats = updateStatsOnCompletion(gameStats);
          setGameStats(newStats);
          saveGameStats(newStats);
          
          // Check for new achievements
          const newAchievements = newStats.achievements.filter(a => !oldAchievements.includes(a));
          if (newAchievements.length > 0) {
            haptics.celebration();
            setNewAchievement(newAchievements[0]);
            setTimeout(() => setNewAchievement(null), 5000);
          }
          
          // Trigger confetti at bubble position
          const bubbleElement = e.currentTarget.getBoundingClientRect();
          setConfettiPosition({
            x: bubbleElement.left + bubbleElement.width / 2,
            y: bubbleElement.top + bubbleElement.height / 2,
          });
          setConfettiTrigger(prev => prev + 1);
        } else {
          haptics.light();
        }
      }
    }
  };

  const handleTaskKeyDown = (id: string, e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (e.altKey) {
        removeTask(id);
      } else {
        const task = tasks.find(t => t.id === id);
        if (task) {
          const wasCompleted = Boolean(task.doneAt);
          updateTask(id, { doneAt: wasCompleted ? null : Date.now() });
          if (!wasCompleted) {
            setHasCompleted(true);
          }
        }
      }
    }
  };

  const handleImportTasks = (importedTasks: Task[]) => {
    setTasks(importedTasks);
    setError(null);
  };

  const handleError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  const handleHintDismiss = (hintId: string) => {
    // Hint dismissed, no action needed
  };

  const handleAddTask = () => {
    // Focus the first input in AddTask component
    const input = document.querySelector('input[placeholder="Add a task…"]') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  };

  const handleExport = () => {
    const data = exportTasks(tasks);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bubble-board-tasks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  const todayCompletes = getTodayCompletes(tasks);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header / Toolbar */}
        <motion.div 
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex-shrink-0">
            <motion.h1 
              className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent whitespace-nowrap"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Eisenhower Bubble Board
            </motion.h1>
          </div>
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
            <GameStatsDisplay stats={gameStats} />
            <AddTask onAddTask={addTask} />
            <Toolbar 
              tasks={tasks} 
              onImportTasks={handleImportTasks}
              onError={handleError}
            />
            <motion.button
              onClick={() => setShowHelp(true)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
              title="Help & Shortcuts"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.button>
          </div>
        </motion.div>

        {/* Achievement Toast */}
        <AchievementToast 
          achievementId={newAchievement} 
          onClose={() => setNewAchievement(null)} 
        />

        {/* Confetti */}
        <Confetti 
          x={confettiPosition.x} 
          y={confettiPosition.y} 
          trigger={confettiTrigger} 
        />

        {/* Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-6 p-4 bg-red-900/50 border border-red-700/50 rounded-xl text-red-200 text-sm backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Board */}
        <motion.div
          ref={boardRef}
          className="relative bg-slate-900/40 rounded-3xl border border-slate-800/50 overflow-hidden backdrop-blur-sm shadow-2xl drag-container"
          style={{ height: 540 }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Axes */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
            {/* grid just for background shading */}
            <div className="border-r border-b border-slate-800/50 bg-gradient-to-br from-red-900/10 to-slate-900/20" />
            <div className="border-b border-slate-800/50 bg-gradient-to-bl from-yellow-900/10 to-slate-900/20" />
            <div className="border-r border-slate-800/50 bg-gradient-to-tr from-blue-900/10 to-slate-900/20" />
            <div className="bg-gradient-to-tl from-slate-900/20 to-slate-900/40" />
          </div>

          {/* Quadrant Labels */}
          <div className="absolute top-2 left-2 text-xs uppercase tracking-wide text-slate-400 font-semibold z-10">
            Urgent ↑
          </div>
          <div className="absolute top-2 right-2 text-xs uppercase tracking-wide text-slate-400 font-semibold z-10">
            Important →
          </div>
          
          {/* Quadrant Names */}
          {/* Top-Left: Not Important + Urgent = Delegate */}
          <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 text-slate-500 text-xs font-medium z-10 pointer-events-none">
            Delegate
          </div>
          {/* Top-Right: Important + Urgent = Do Now */}
          <div className="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2 text-slate-500 text-xs font-medium z-10 pointer-events-none">
            Do Now
          </div>
          {/* Bottom-Left: Not Important + Not Urgent = Eliminate */}
          <div className="absolute bottom-1/4 left-1/4 transform -translate-x-1/2 translate-y-1/2 text-slate-500 text-xs font-medium z-10 pointer-events-none">
            Eliminate
          </div>
          {/* Bottom-Right: Important + Not Urgent = Plan */}
          <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 text-slate-500 text-xs font-medium z-10 pointer-events-none">
            Plan
          </div>

          {/* Bubbles */}
          <AnimatePresence>
            {tasks.map((task) => (
              <Bubble
                key={task.id}
                task={task}
                onMove={(x, y) => handleTaskMove(task.id, x, y)}
                onClick={(e) => handleTaskClick(task.id, e)}
                onKeyDown={(e) => handleTaskKeyDown(task.id, e)}
              />
            ))}
          </AnimatePresence>

          {/* Empty state */}
          <AnimatePresence>
            {tasks.length === 0 && (
              <motion.div 
                className="absolute inset-0 flex flex-col items-center justify-center text-slate-400"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-lg font-medium">Add your first task</p>
                <p className="text-sm text-slate-500 mt-1">Start organizing your priorities</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Onboarding Hints */}
        <OnboardingHints
          hasTasks={tasks.length > 0}
          hasDragged={hasDragged}
          hasCompleted={hasCompleted}
          onDismiss={handleHintDismiss}
        />

        {/* Help Modal */}
        <HelpModal
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
        />

        {/* Keyboard Shortcuts */}
        <KeyboardShortcuts
          onAddTask={handleAddTask}
          onExport={handleExport}
          onImport={handleImport}
        />
      </div>
    </div>
  );
}
