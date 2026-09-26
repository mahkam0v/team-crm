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
    positive: { text: 'text-positive', chip: 'bg-positive/10 text-positive', icon: 'trending_up' },
    negative: { text: 'text-negative', chip: 'bg-negative/10 text-negative', icon: 'trending_down' },
    warning: { text: 'text-warning', chip: 'bg-warning/10 text-warning', icon: 'clock' },
    default: { text: 'text-white', chip: 'bg-accent/10 text-accent', icon: 'bar_chart' },
  }[tone];

  return (
    <div
      onClick={onClick}
      className={`
        card
        ${onClick ? 'cursor-pointer group hover:border-white/[0.1] hover:-translate-y-0.5 active:translate-y-0' : ''}
        transition-all duration-200
      `}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10.5px] uppercase tracking-wider text-muted/50 font-medium">
          {label}
        </div>
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${toneConfig.chip}`}>
          <Icon name={toneConfig.icon} className="w-3.5 h-3.5" strokeWidth={2} />
        </span>
      </div>
      <div className={`num text-[22px] mt-2 font-bold ${toneConfig.text}`}>
        {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
        {suffix && <span className="text-[11px] text-muted/40 ml-1 font-normal">{suffix}</span>}
      </div>
      {hint && (
        <div className="text-[10px] text-muted/40 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 leading-relaxed">
          {hint}
        </div>
      )}
    </div>
  );
};
