// Haptic feedback utilities for mobile devices

export const haptics = {
  // Light tap feedback
  light: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  // Medium impact feedback
  medium: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },

  // Heavy impact feedback
  heavy: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }
  },

  // Success pattern
  success: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
  },

  // Error pattern
  error: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([20, 100, 20]);
    }
  },

  // Selection pattern
  selection: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(5);
    }
  },

  // Celebration pattern
  celebration: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([30, 50, 30, 50, 50]);
    }
  },
};
