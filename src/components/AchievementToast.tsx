'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ACHIEVEMENTS } from '@/lib/gamification';

interface AchievementToastProps {
  achievementId: string | null;
  onClose: () => void;
}

export default function AchievementToast({ achievementId, onClose }: AchievementToastProps) {
  if (!achievementId) return null;

  const achievement = ACHIEVEMENTS[achievementId as keyof typeof ACHIEVEMENTS];
  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        initial={{ opacity: 0, y: -100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.8 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
      >
        <motion.div
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl shadow-2xl border-2 border-amber-300 px-6 py-4 min-w-[300px]"
          animate={{
            boxShadow: [
              "0 0 20px rgba(245, 158, 11, 0.5)",
              "0 0 40px rgba(245, 158, 11, 0.8)",
              "0 0 20px rgba(245, 158, 11, 0.5)",
            ]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="text-4xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              {achievement.icon}
            </motion.div>
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-100">
                Achievement Unlocked!
              </div>
              <div className="text-lg font-bold">{achievement.name}</div>
              <div className="text-sm text-amber-100">{achievement.description}</div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
