'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingHintsProps {
  hasTasks: boolean;
  hasDragged: boolean;
  hasCompleted: boolean;
  onDismiss: (hint: string) => void;
}

const HINTS = [
  {
    id: 'add-task',
    text: 'Add a task',
    condition: (props: OnboardingHintsProps) => !props.hasTasks,
  },
  {
    id: 'drag-prioritize',
    text: 'Drag to prioritize',
    condition: (props: OnboardingHintsProps) => props.hasTasks && !props.hasDragged,
  },
  {
    id: 'click-complete',
    text: 'Click to complete',
    condition: (props: OnboardingHintsProps) => props.hasTasks && !props.hasCompleted,
  },
];

export default function OnboardingHints({ hasTasks, hasDragged, hasCompleted, onDismiss }: OnboardingHintsProps) {
  const [seenHints, setSeenHints] = useState<Set<string>>(new Set());
  const [visibleHints, setVisibleHints] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load seen hints from localStorage
    const stored = localStorage.getItem('ebb_seen_hints');
    if (stored) {
      try {
        setSeenHints(new Set(JSON.parse(stored)));
      } catch {
        // Ignore invalid data
      }
    }
  }, []);

  useEffect(() => {
    // Show hints based on current state
    const newVisibleHints = new Set<string>();
    
    HINTS.forEach(hint => {
      if (!seenHints.has(hint.id) && hint.condition({ hasTasks, hasDragged, hasCompleted, onDismiss })) {
        newVisibleHints.add(hint.id);
      }
    });

    setVisibleHints(newVisibleHints);
  }, [hasTasks, hasDragged, hasCompleted, seenHints]);

  useEffect(() => {
    // Auto-dismiss after 1 minute
    const timer = setTimeout(() => {
      visibleHints.forEach(hintId => {
        handleDismiss(hintId);
      });
    }, 60000);

    return () => clearTimeout(timer);
  }, [visibleHints]);

  const handleDismiss = (hintId: string) => {
    const newSeenHints = new Set(seenHints);
    newSeenHints.add(hintId);
    setSeenHints(newSeenHints);
    setVisibleHints(prev => {
      const next = new Set(prev);
      next.delete(hintId);
      return next;
    });
    
    // Save to localStorage
    localStorage.setItem('ebb_seen_hints', JSON.stringify(Array.from(newSeenHints)));
    onDismiss(hintId);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {Array.from(visibleHints).map(hintId => {
          const hint = HINTS.find(h => h.id === hintId);
          if (!hint) return null;

          return (
            <motion.div
              key={hintId}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <span>{hint.text}</span>
                <button
                  onClick={() => handleDismiss(hintId)}
                  className="text-slate-400 hover:text-slate-200 text-xs"
                  aria-label="Dismiss hint"
                >
                  ×
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
