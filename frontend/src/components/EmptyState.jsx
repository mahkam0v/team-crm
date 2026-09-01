import { Icon } from './Icon.jsx';

export const EmptyState = ({ icon = 'folder', title, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 animate-fade-in">
    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-4">
      <Icon name={icon} className="w-7 h-7 text-muted/25" />
    </div>
    <p className="text-muted/50 text-[13px] mb-5 max-w-sm leading-relaxed">{title}</p>
    {actionLabel && onAction && (
      <button onClick={onAction} className="btn-primary">
        <span className="flex items-center gap-1.5">
          <Icon name="plus" className="w-3.5 h-3.5" strokeWidth={2.5} />
          {actionLabel}
        </span>
      </button>
    )}
  </div>
);
