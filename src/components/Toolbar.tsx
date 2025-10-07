'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, exportTasks, importTasks } from '@/lib/storage';

interface ToolbarProps {
  tasks: Task[];
  onImportTasks: (tasks: Task[]) => void;
  onError: (message: string) => void;
}

export default function Toolbar({ tasks, onImportTasks, onError }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const todayCompletes = tasks.filter(t => t.doneAt && new Date(t.doneAt).toDateString() === new Date().toDateString()).length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.doneAt).length;

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    
    // Add a small delay for better UX feedback
    await new Promise(resolve => setTimeout(resolve, 300));
    
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
    
    setIsExporting(false);
  };

  const handleImport = () => {
    if (isImporting) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    // Add a small delay for better UX feedback
    await new Promise(resolve => setTimeout(resolve, 300));

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const importedTasks = importTasks(jsonString);
        onImportTasks(importedTasks);
      } catch (error) {
        onError('Invalid file format. Please select a valid JSON file.');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
  };

  return (
    <motion.div 
      className="flex items-center gap-3 flex-shrink-0"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {/* Stats */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-slate-400 whitespace-nowrap">Today:</span>
          <span className="text-emerald-400 font-bold">{todayCompletes}</span>
        </div>
        
        <div className="w-px h-4 bg-slate-700" />
        
        <div className="text-slate-400 whitespace-nowrap">
          <span className="text-slate-200 font-semibold">{completedTasks}</span>
          <span className="text-slate-500">/{totalTasks}</span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <motion.button
          onClick={handleExport}
          disabled={isExporting || tasks.length === 0}
          className="px-3 py-2 rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 text-slate-300 hover:from-slate-700 hover:to-slate-600 hover:border-slate-500 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5 text-sm whitespace-nowrap"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <AnimatePresence mode="wait">
            {isExporting ? (
              <motion.div
                key="exporting"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5"
              >
                <div className="w-3 h-3 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
                <span>Export</span>
              </motion.div>
            ) : (
              <motion.div
                key="export"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
        
        <motion.button
          onClick={handleImport}
          disabled={isImporting}
          className="px-3 py-2 rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 text-slate-300 hover:from-slate-700 hover:to-slate-600 hover:border-slate-500 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5 text-sm whitespace-nowrap"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <AnimatePresence mode="wait">
            {isImporting ? (
              <motion.div
                key="importing"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5"
              >
                <div className="w-3 h-3 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
                <span>Import</span>
              </motion.div>
            ) : (
              <motion.div
                key="import"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span>Import</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </motion.div>
  );
}
