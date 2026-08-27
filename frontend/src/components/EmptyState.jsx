export const EmptyState = ({ icon = '📭', title, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center text-center py-12">
    <div className="text-3xl mb-3">{icon}</div>
    <p className="text-muted text-[13.5px] mb-4">{title}</p>
    {actionLabel && onAction && (
      <button onClick={onAction} className="btn-primary">{actionLabel}</button>
    )}
  </div>
);
