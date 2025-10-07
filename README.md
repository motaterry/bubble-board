# Eisenhower Bubble Board

A beautiful, interactive task management app based on the Eisenhower Matrix. Organize your tasks by urgency and importance using an intuitive drag-and-drop interface.

## 🌐 Live Demo

**[Try it now →](https://bubble-board-k1x3xh1uu-terrymota0-gmailcoms-projects.vercel.app)**

## Features

### 🎯 Core Functionality
- **2x2 Quadrant Board**: Organize tasks by urgency (Y-axis) and importance (X-axis)
- **Drag & Drop**: Move tasks between quadrants to reprioritize
- **Task Completion**: Click bubbles to mark as complete
- **Impact Sizing**: Choose Small (S), Medium (M), or Large (L) impact for visual priority
- **Local Storage**: All data persists automatically in your browser

### 🎨 Enhanced UX
- **Smooth Animations**: Powered by Framer Motion for delightful interactions
- **Visual Feedback**: Glowing effects, scale animations, and completion celebrations
- **Responsive Design**: Works beautifully on desktop and mobile
- **Dark Theme**: Easy on the eyes with a modern dark palette
- **Gradient Backgrounds**: Subtle quadrant color coding for better visual organization

### ⌨️ Keyboard Shortcuts
- `Ctrl/Cmd + Enter`: Add new task
- `Ctrl/Cmd + E`: Export tasks
- `Ctrl/Cmd + I`: Import tasks
- `Space/Enter`: Toggle task completion (when focused)
- `Alt + Space/Enter`: Delete task (when focused)
- `Tab`: Navigate between tasks

### 📊 Smart Features
- **Today's Completions**: Track your daily progress
- **Import/Export**: Backup and restore your tasks
- **Onboarding Hints**: Guided experience for new users
- **Error Handling**: Graceful error messages and validation
- **Accessibility**: Full keyboard navigation and ARIA labels

### 🎯 Quadrant Guide
- **Do Now** (Urgent + Important): Critical tasks requiring immediate attention
- **Plan** (Important + Not Urgent): Strategic tasks to schedule
- **Delegate** (Urgent + Not Important): Tasks to assign to others
- **Eliminate** (Not Urgent + Not Important): Tasks to remove from your list

## Getting Started

1. **Add Tasks**: Type in the input field and press Enter or click "Add Task"
2. **Set Impact**: Choose S/M/L to control bubble size
3. **Organize**: Drag bubbles to the appropriate quadrant
4. **Complete**: Click bubbles to mark as done
5. **Delete**: Alt+Click bubbles to remove them

## Technical Stack

- **Next.js 15** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Zod** for data validation
- **Local Storage** for persistence

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Data Format

Tasks are stored as JSON with the following structure:

```typescript
{
  id: string;
  title: string;
  x: number; // 0-1 importance (0=low, 1=high)
  y: number; // 0-1 urgency (0=high, 1=low)
  impact: 1 | 2 | 3; // S/M/L
  doneAt?: number | null; // timestamp when completed
}
```

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers with touch support

---

Built with ❤️ for productivity enthusiasts who believe in the power of visual task management.