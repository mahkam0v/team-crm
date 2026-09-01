import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon.jsx';

const AnimatedNumber = ({ value, duration = 800 }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (typeof value !== 'number') { setDisplay(value); return; }
    const start = display;
    const diff = value - start;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);

  return <>{typeof display === 'number' ? display.toLocaleString() : display}</>;
};

export const StatCard = ({ label, value, tone = 'default', suffix = "so'm", onClick, hint }) => {
  const toneConfig = {
    positive: {
      border: 'border-l-positive',
      text: 'text-positive',
      gradient: 'from-positive/5 to-transparent',
      icon: 'trending_up',
    },
    negative: {
      border: 'border-l-negative',
      text: 'text-negative',
      gradient: 'from-negative/5 to-transparent',
      icon: 'trending_down',
    },
    warning: {
      border: 'border-l-warning',
      text: 'text-warning',
      gradient: 'from-warning/5 to-transparent',
      icon: 'clock',
    },
    default: {
      border: 'border-l-accent',
      text: 'text-white/90',
      gradient: 'from-accent/5 to-transparent',
      icon: 'bar_chart',
    },
  }[tone];

  return (
    <div
      onClick={onClick}
      className={`
        card border-l-[3px] ${toneConfig.border}
        bg-gradient-to-r ${toneConfig.gradient}
        ${onClick ? 'cursor-pointer group hover:border-white/[0.08] hover:-translate-y-0.5 active:translate-y-0' : ''}
        transition-all duration-200
      `}
    >
      <div className="flex items-center justify-between">
        <div className="text-[10.5px] uppercase tracking-wider text-muted/40 font-medium group-hover:text-white/50 transition-colors duration-150">
          {label}
        </div>
        <Icon name={toneConfig.icon} className="w-3.5 h-3.5 opacity-25 group-hover:opacity-40 transition-opacity" strokeWidth={1.8} />
      </div>
      <div className={`num text-[22px] mt-1 font-bold ${toneConfig.text}`}>
        {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
        {suffix && <span className="text-[11px] text-muted/30 ml-1 font-normal">{suffix}</span>}
      </div>
      {hint && (
        <div className="text-[10px] text-muted/30 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 leading-relaxed">
          {hint}
        </div>
      )}
    </div>
  );
};
