export const EmptyState = ({ icon = '📭', title, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 animate-fade-in">
    <div className="text-5xl mb-4 animate-float">{icon}</div>
    <p className="text-muted text-[14px] mb-5 max-w-xs">{title}</p>
    {actionLabel && onAction && (
      <button onClick={onAction} className="btn-primary group">
        <span className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {actionLabel}
        </span>
      </button>
    )}
  </div>
);
