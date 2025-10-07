'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const shortcuts = [
    { key: 'Ctrl/Cmd + Enter', description: 'Add new task' },
    { key: 'Ctrl/Cmd + E', description: 'Export tasks' },
    { key: 'Ctrl/Cmd + I', description: 'Import tasks' },
    { key: 'Space/Enter', description: 'Toggle task completion (when focused)' },
    { key: 'Alt + Space/Enter', description: 'Delete task (when focused)' },
    { key: 'Tab', description: 'Navigate between tasks' },
  ];

  const interactions = [
    { action: 'Drag bubble', description: 'Move task to different quadrant' },
    { action: 'Click bubble', description: 'Toggle completion status' },
    { action: 'Alt + Click bubble', description: 'Delete task' },
    { action: 'Hover impact selector', description: 'See impact description' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-100">Help & Shortcuts</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close help modal"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Keyboard Shortcuts */}
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-3">Keyboard Shortcuts</h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-300">{shortcut.description}</span>
                      <kbd className="px-2 py-1 bg-slate-700 text-slate-200 text-sm rounded font-mono">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactions */}
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-3">Interactions</h3>
                <div className="space-y-2">
                  {interactions.map((interaction, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-300">{interaction.description}</span>
                      <span className="text-slate-400 text-sm font-medium">{interaction.action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quadrant Guide */}
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-3">Quadrant Guide</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
                    <div className="text-red-400 font-semibold text-sm">Do Now</div>
                    <div className="text-slate-400 text-xs mt-1">Urgent & Important</div>
                  </div>
                  <div className="p-3 bg-yellow-900/20 border border-yellow-800/30 rounded-lg">
                    <div className="text-yellow-400 font-semibold text-sm">Plan</div>
                    <div className="text-slate-400 text-xs mt-1">Important, Not Urgent</div>
                  </div>
                  <div className="p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                    <div className="text-blue-400 font-semibold text-sm">Delegate</div>
                    <div className="text-slate-400 text-xs mt-1">Urgent, Not Important</div>
                  </div>
                  <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                    <div className="text-slate-400 font-semibold text-sm">Eliminate</div>
                    <div className="text-slate-500 text-xs mt-1">Not Urgent, Not Important</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
