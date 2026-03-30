import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import useTheme from '../../hooks/useTheme';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-raised transition-all duration-300 group ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {isDark ? (
          <Moon size={18} className="text-primary-500" />
        ) : (
          <Sun size={18} className="text-accent-amber" />
        )}
      </motion.div>

      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
        isDark ? 'shadow-[0_0_12px_rgba(108,138,255,0.3)]' : 'shadow-[0_0_12px_rgba(181,106,16,0.2)]'
      }`} />
    </button>
  );
};

export default ThemeToggle;
