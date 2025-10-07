'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/lib/storage';
import { haptics } from '@/lib/haptics';

interface AddTaskProps {
  onAddTask: (task: Omit<Task, 'id'>) => void;
}

export default function AddTask({ onAddTask }: AddTaskProps) {
  const [title, setTitle] = useState('');
  const [impact, setImpact] = useState<1 | 2 | 3>(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    haptics.medium();
    
    // Add a small delay for better UX feedback
    await new Promise(resolve => setTimeout(resolve, 150));

    onAddTask({
      title: title.trim(),
      x: 0.5, // Start in center
      y: 0.5,
      impact,
    });

    setTitle('');
    setImpact(2);
    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const impactLabels = {
    1: { label: 'S', desc: 'Small', color: 'text-blue-400' },
    2: { label: 'M', desc: 'Medium', color: 'text-green-400' },
    3: { label: 'L', desc: 'Large', color: 'text-orange-400' },
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="flex items-center gap-2 flex-shrink-0"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add task…"
          className="px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700 w-48 outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 placeholder:text-slate-500 text-sm"
          maxLength={200}
          disabled={isSubmitting}
        />
        <AnimatePresence>
          {title.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-2 -right-2 bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full"
            >
              {title.length}/200
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="relative group">
        <select
          value={impact}
          onChange={(e) => setImpact(Number(e.target.value) as 1 | 2 | 3)}
          className="px-2 py-2 rounded-lg bg-slate-900/80 border border-slate-700 appearance-none cursor-pointer focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 text-sm pr-7"
          title="Impact (size)"
          disabled={isSubmitting}
        >
          <option value={1}>S</option>
          <option value={2}>M</option>
          <option value={3}>L</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          {impactLabels[impact].desc} Impact
        </div>
      </div>
      
      <motion.button
        type="submit"
        disabled={!title.trim() || isSubmitting}
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 text-white font-medium hover:from-sky-600 hover:to-sky-700 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-sky-500/25 text-sm whitespace-nowrap"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <AnimatePresence mode="wait">
          {isSubmitting ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5"
            >
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Add</span>
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              Add
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.form>
  );
}
