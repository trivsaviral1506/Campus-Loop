import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative flex h-10 w-20 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        theme === "dark" ? "bg-slate-800" : "bg-slate-200"
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full shadow-sm",
          theme === "dark" ? "bg-slate-950 text-slate-200" : "bg-white text-slate-800"
        )}
        style={{
          marginLeft: theme === "dark" ? "auto" : "0",
        }}
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: theme === "dark" ? 360 : 0 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          {theme === "dark" ? (
            <Moon size={16} strokeWidth={2.5} />
          ) : (
            <Sun size={16} strokeWidth={2.5} />
          )}
        </motion.div>
      </motion.div>
    </button>
  );
}
