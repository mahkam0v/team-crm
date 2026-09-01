import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon.jsx';

const commands = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/', group: 'Navigation' },
  { id: 'projects', label: 'Loyihalar', icon: 'projects', path: '/projects', group: 'Navigation' },
  { id: 'projects-new', label: 'Yangi loyiha yaratish', icon: 'plus', path: '/projects/new', group: 'Navigation' },
  { id: 'tasks', label: 'Vazifalar', icon: 'tasks', path: '/tasks', group: 'Navigation' },
  { id: 'finance', label: 'Moliya', icon: 'finance', path: '/finance', group: 'Navigation' },
  { id: 'profile', label: 'Profil', icon: 'user', path: '/profile', group: 'Navigation' },
  { id: 'admin', label: 'Admin panel', icon: 'admin', path: '/admin', group: 'Navigation', adminOnly: true },
];

export const CommandPalette = ({ isOpen, onClose, isAdmin }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filtered = commands.filter((cmd) => {
    if (cmd.adminOnly && !isAdmin) return false;
    if (!query) return true;
    return cmd.label.toLowerCase().includes(query.toLowerCase());
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeCommand = useCallback((cmd) => {
    navigate(cmd.path);
    onClose();
  }, [navigate, onClose]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      executeCommand(filtered[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div
        className="cmd-palette animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 border-b border-white/[0.05]">
          <Icon name="search" className="w-4 h-4 text-muted/50 shrink-0" />
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder="Buyruq yoki sahifa qidirish..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd className="cmd-kbd">Esc</kbd>
        </div>
        <div className="cmd-results" ref={listRef}>
          {filtered.length === 0 ? (
            <div className="px-5 py-8 text-center text-[13px] text-muted/50">
              Hech narsa topilmadi
            </div>
          ) : (
            <>
              <div className="px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted/40">
                Sahifalar
              </div>
              {filtered.map((cmd, i) => (
                <button
                  key={cmd.id}
                  className={`cmd-item ${i === selectedIndex ? 'active' : ''}`}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <Icon name={cmd.icon} className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left">{cmd.label}</span>
                  <Icon name="chevron_right" className="w-3 h-3 text-muted/30" />
                </button>
              ))}
            </>
          )}
        </div>
        <div className="flex items-center gap-4 px-5 py-2.5 border-t border-white/[0.04] text-[10px] text-muted/30">
          <span className="flex items-center gap-1.5">
            <kbd className="cmd-kbd">↑↓</kbd> navigatsiya
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="cmd-kbd">Enter</kbd> ochish
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="cmd-kbd">Esc</kbd> yopish
          </span>
        </div>
      </div>
    </div>
  );
};
