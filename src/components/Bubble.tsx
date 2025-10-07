'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Task } from '@/lib/storage';
import { getQuadrantLabel } from '@/lib/metrics';
import { haptics } from '@/lib/haptics';

interface BubbleProps {
  task: Task;
  onMove: (x: number, y: number) => void;
  onClick: (e: React.MouseEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export default function Bubble({ task, onMove, onClick, onKeyDown }: BubbleProps) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [parentRect, setParentRect] = useState<DOMRect | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    parentRef.current = nodeRef.current?.parentElement as HTMLDivElement | null;
    const recalc = () => setParentRect(parentRef.current?.getBoundingClientRect() ?? null);
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  const baseSize = task.impact === 3 ? 96 : task.impact === 2 ? 72 : 56;
  const size = baseSize;

  // Motion values - initialize once
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);

  // Convert normalized 0..1 to px and sync only when task position or parent rect changes
  useEffect(() => {
    if (!isDraggingRef.current && parentRect) {
      const left = task.x * parentRect.width;
      const top = task.y * parentRect.height;
      mvX.set(left);
      mvY.set(top);
    }
  }, [task.x, task.y, parentRect, mvX, mvY]);

  // Completion style
  const done = Boolean(task.doneAt);
  const quadrantLabel = getQuadrantLabel(task.x, task.y);

  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

  return (
    <motion.div
      ref={nodeRef}
      className="absolute select-none"
      style={{ x: mvX, y: mvY, width: size, height: size }}
      data-testid="bubble"
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={parentRef}
      whileDrag={{ 
        scale: 1.1,
        rotate: 1,
        zIndex: 50,
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
      }}
      onDragStart={() => {
        isDraggingRef.current = true;
        haptics.light();
        // Add subtle glow effect while dragging
        if (nodeRef.current) {
          nodeRef.current.style.filter = 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))';
          nodeRef.current.classList.add('dragging');
        }
      }}
      onDragEnd={(_, info) => {
        if (!parentRect) return;
        
        haptics.medium();
        
        // Get the current position from the motion values
        const currentX = mvX.get();
        const currentY = mvY.get();
        
        // Calculate the final position based on the drag offset
        const finalX = currentX;
        const finalY = currentY;
        
        // Ensure the bubble stays within bounds
        const clampedX = Math.max(0, Math.min(parentRect.width - size, finalX));
        const clampedY = Math.max(0, Math.min(parentRect.height - size, finalY));
        
        // Convert to normalized coordinates (0-1)
        const nx = clamp01(clampedX / parentRect.width);
        const ny = clamp01(clampedY / parentRect.height);
        
        // Update the motion values to the final position
        mvX.set(clampedX);
        mvY.set(clampedY);
        
        onMove(nx, ny);
        
        // Remove glow effect and dragging class
        if (nodeRef.current) {
          nodeRef.current.style.filter = '';
          nodeRef.current.classList.remove('dragging');
        }
        
        // Add a small delay before allowing clicks again to prevent accidental clicks
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 100);
      }}
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0, rotate: 180 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      <motion.button
        onClick={(e) => {
          // Prevent click events during drag
          if (isDraggingRef.current) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          onClick(e);
        }}
        onKeyDown={onKeyDown}
        className={`w-full h-full rounded-full border-2 ${
          done
            ? "bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-200 text-emerald-900 shadow-emerald-500/25"
            : "bg-gradient-to-br from-sky-400 to-sky-600 border-sky-200 text-slate-900 shadow-sky-500/25"
        } shadow-xl backdrop-blur-sm flex items-center justify-center text-center font-semibold focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all duration-200`}
        whileTap={{ scale: 0.9 }}
        whileHover={{ 
          scale: 1.15,
          zIndex: 100,
          boxShadow: done 
            ? "0 15px 50px rgba(16, 185, 129, 0.6)" 
            : "0 15px 50px rgba(59, 130, 246, 0.6)"
        }}
        animate={done ? { 
          scale: [1, 1.1, 1],
          boxShadow: [
            "0 4px 20px rgba(16, 185, 129, 0.2)",
            "0 8px 30px rgba(16, 185, 129, 0.4)",
            "0 4px 20px rgba(16, 185, 129, 0.2)"
          ]
        } : {}}
        transition={{ 
          duration: 0.4, 
          ease: "easeOut",
          boxShadow: { duration: 0.6 }
        }}
        title={`${quadrantLabel} • ${done ? "Completed" : "Click to complete"}. Alt+Click to delete.`}
        aria-label={`${task.title} in ${quadrantLabel} quadrant. ${done ? "Completed" : "Not completed"}. Press Space or Enter to toggle completion, Alt+Space or Alt+Enter to delete.`}
        tabIndex={0}
      >
        <div className="px-2 relative">
          {done && (
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-200 rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <span className="text-emerald-800 text-xs">✓</span>
            </motion.div>
          )}
          <div className="text-[10px] leading-3 opacity-90 mb-0.5 uppercase tracking-wide font-bold">
            {quadrantLabel}
          </div>
          <div className="text-xs leading-tight line-clamp-2 font-medium">
            {task.title}
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}
