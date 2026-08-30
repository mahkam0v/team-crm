const styles = {
  PLANNING: 'bg-muted/15 text-muted border border-muted/20',
  IN_PROGRESS: 'bg-accent/15 text-accent border border-accent/20',
  COMPLETED: 'bg-positive/15 text-positive border border-positive/20',
  CANCELLED: 'bg-negative/15 text-negative border border-negative/20',
  ON_HOLD: 'bg-warning/15 text-warning border border-warning/20',
  TODO: 'bg-muted/15 text-muted border border-muted/20',
  URGENT: 'bg-negative/15 text-negative border border-negative/20',
  HIGH: 'bg-warning/15 text-warning border border-warning/20',
  MEDIUM: 'bg-accent/15 text-accent border border-accent/20',
  LOW: 'bg-muted/15 text-muted border border-muted/20',
};

const dotColors = {
  PLANNING: 'bg-muted',
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
  <span className={`inline-flex items-center font-medium rounded-full ${small ? 'text-[10px] px-1.5 py-0.5 gap-1' : 'text-[11px] px-2.5 py-1 gap-1.5'} ${styles[status] || 'bg-muted/15 text-muted border border-muted/20'}`}>
    {dotColors[status] && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status]} ${status === 'IN_PROGRESS' ? 'animate-pulse' : ''}`} />}
    {labels[status] || status}
  </span>
);

export const PriorityBadge = ({ priority }) => {
  const icons = {
    LOW: '↓',
    MEDIUM: '→',
    HIGH: '↑',
    URGENT: '⚡',
  };

  return (
    <span className={`inline-flex items-center gap-1 font-mono uppercase text-[10px] px-1.5 py-0.5 rounded-md ${styles[priority] || 'text-muted border border-muted/20'}`}>
      <span>{icons[priority]}</span>
      {priority}
    </span>
  );
};
