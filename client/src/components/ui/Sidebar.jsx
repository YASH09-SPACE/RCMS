import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ items = [], title, subtitle, isOpen, onClose, className = '' }) => {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[260px] bg-sidebar z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${className}`}
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              {subtitle && (
                <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-white/40 block mb-1">
                  {subtitle}
                </span>
              )}
              <h2 className="text-sm font-bold text-white leading-tight">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 no-scrollbar">
          {items.map((section, sIdx) => (
            <div key={sIdx} className="mb-5">
              {section.label && (
                <div className="px-5 mb-2 text-[9px] font-mono font-medium uppercase tracking-[0.14em] text-white/35">
                  {section.label}
                </div>
              )}
              {section.links.map((link, lIdx) => (
                <NavLink
                  key={lIdx}
                  to={link.to}
                  end={link.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-5 py-2 text-[13px] font-medium transition-all duration-150 border-l-2 ${
                      isActive
                        ? 'text-white border-l-primary-500 bg-white/[0.06]'
                        : 'text-white/55 border-l-transparent hover:text-white hover:bg-white/[0.04]'
                    }`
                  }
                >
                  {link.icon && <link.icon size={16} />}
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-auto text-[10px] font-mono bg-primary-500/20 text-primary-400 px-1.5 py-0.5 rounded">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
