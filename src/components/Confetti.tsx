'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
  x: number;
  y: number;
  trigger: number; // Change this to trigger new confetti
}

interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
}

const COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#06b6d4', // cyan
];

export default function Confetti({ x, y, trigger }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;

    // Generate particles
    const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 20;
      const velocity = 2 + Math.random() * 3;
      
      return {
        id: `${Date.now()}-${i}`,
        x,
        y,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 6,
        rotation: Math.random() * 360,
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity - 2, // Add upward bias
      };
    });

    setParticles(newParticles);

    // Clear particles after animation
    const timeout = setTimeout(() => {
      setParticles([]);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [trigger, x, y]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
            }}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              rotate: particle.rotation,
              scale: 1,
            }}
            animate={{
              x: particle.velocityX * 100,
              y: particle.velocityY * 100 + 200, // Gravity effect
              opacity: 0,
              rotate: particle.rotation + 360,
              scale: 0.5,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
