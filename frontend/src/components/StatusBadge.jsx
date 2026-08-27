const styles = {
  PLANNING: 'bg-muted/15 text-muted',
  IN_PROGRESS: 'bg-accent/15 text-accent',
  COMPLETED: 'bg-positive/15 text-positive',
  CANCELLED: 'bg-negative/15 text-negative',
  ON_HOLD: 'bg-warning/15 text-warning',
  TODO: 'bg-muted/15 text-muted',
  URGENT: 'bg-negative/15 text-negative',
  HIGH: 'bg-warning/15 text-warning',
  MEDIUM: 'bg-accent/15 text-accent',
  LOW: 'bg-muted/15 text-muted',
};

const labels = {
  PLANNING: 'Rejalashtirish',
  IN_PROGRESS: 'Faol',
  COMPLETED: 'Yakunlangan',
  CANCELLED: 'Bekor qilingan',
  ON_HOLD: 'Kutmoqda',
};

export const StatusBadge = ({ status, small = false }) => (
  <span className={`inline-flex items-center font-medium rounded-full ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-1'} ${styles[status] || 'bg-muted/15 text-muted'}`}>
    {labels[status] || status}
  </span>
);

export const PriorityBadge = ({ priority }) => (
  <span className={`inline-flex items-center font-mono uppercase text-[10px] px-1.5 py-0.5 rounded ${styles[priority] || 'text-muted'}`}>
    {priority}
  </span>
);
