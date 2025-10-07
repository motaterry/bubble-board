'use client';

import { motion } from 'framer-motion';
import { GameStats, getCurrentLevelProgress } from '@/lib/gamification';

interface GameStatsProps {
  stats: GameStats;
}

export default function GameStatsDisplay({ stats }: GameStatsProps) {
  const progress = getCurrentLevelProgress(stats.xp, stats.level);

  return (
    <motion.div 
      className="flex items-center gap-4 text-xs"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Streak */}
      {stats.streak > 0 && (
        <motion.div 
          className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg px-2 py-1"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span 
            className="text-base"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 2
            }}
          >
            🔥
          </motion.span>
          <span className="text-orange-400 font-bold">{stats.streak}</span>
          <span className="text-orange-300/70">day{stats.streak !== 1 ? 's' : ''}</span>
        </motion.div>
      )}

      {/* Level & XP */}
      <motion.div 
        className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg px-2 py-1"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-1">
          <span className="text-purple-400 font-bold">Lv {stats.level}</span>
        </div>
        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Total Completed */}
      <motion.div 
        className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-lg px-2 py-1"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-base">✨</span>
        <span className="text-emerald-400 font-bold">{stats.totalCompleted}</span>
        <span className="text-emerald-300/70">total</span>
      </motion.div>
    </motion.div>
  );
}
