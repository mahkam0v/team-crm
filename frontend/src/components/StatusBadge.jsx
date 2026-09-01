import { Icon } from './Icon.jsx';

const styles = {
  PLANNING: 'bg-info/10 text-info border border-info/15',
  IN_PROGRESS: 'bg-accent/10 text-accent border border-accent/15',
  COMPLETED: 'bg-positive/10 text-positive border border-positive/15',
  CANCELLED: 'bg-negative/10 text-negative border border-negative/15',
  ON_HOLD: 'bg-warning/10 text-warning border border-warning/15',
  TODO: 'bg-white/[0.05] text-muted border border-white/[0.06]',
  URGENT: 'bg-rose/10 text-rose border border-rose/15',
  HIGH: 'bg-warning/10 text-warning border border-warning/15',
  MEDIUM: 'bg-accent/10 text-accent border border-accent/15',
  LOW: 'bg-white/[0.05] text-muted border border-white/[0.06]',
};

const iconNames = {
  PLANNING: 'file_text',
  IN_PROGRESS: 'zap',
  COMPLETED: 'check_circle',
  CANCELLED: 'x_circle',
  ON_HOLD: 'clock',
};

const dotColors = {
  PLANNING: 'bg-info',
  IN_PROGRESS: 'bg-accent',
  COMPLETED: 'bg-positive',
  CANCELLED: 'bg-negative',
  ON_HOLD: 'bg-warning',
};

const labels = {
  PLANNING: 'Rejalashtirish',
  IN_PROGRESS: 'Faol',
  COMPLETED: 'Yakunlangan',
  CANCELLED: 'Bekor qilingan',
  ON_HOLD: 'Kutmoqda',
};

export const StatusBadge = ({ status, small = false }) => (
  <span className={`inline-flex items-center font-medium rounded-md ${small ? 'text-[10px] px-1.5 py-0.5 gap-1' : 'text-[11px] px-2 py-0.5 gap-1.5'} ${styles[status] || 'bg-white/[0.05] text-muted border border-white/[0.06]'}`}>
    {iconNames[status] && (
      <Icon name={iconNames[status]} className={`${small ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} strokeWidth={2} />
    )}
    {dotColors[status] && !iconNames[status] && (
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status]} ${status === 'IN_PROGRESS' ? 'animate-pulse' : ''}`} />
    )}
    {labels[status] || status}
  </span>
);

export const PriorityBadge = ({ priority }) => {
  const iconMap = {
    LOW: 'arrow_down',
    MEDIUM: 'arrow_right',
    HIGH: 'arrow_up',
    URGENT: 'zap',
  };

  return (
    <span className={`inline-flex items-center gap-1 font-medium text-[10px] px-1.5 py-0.5 rounded-md ${styles[priority] || 'text-muted border border-white/[0.06]'}`}>
      <Icon name={iconMap[priority] || 'arrow_right'} className="w-2.5 h-2.5" strokeWidth={2.5} />
      {priority}
    </span>
  );
};
