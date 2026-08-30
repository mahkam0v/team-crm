export const PendingActions = ({ onComplete, onCancel }) => (
  <div className="flex gap-1.5 shrink-0">
    <button
      onClick={(e) => { e.stopPropagation(); onComplete(); }}
      className="text-[11px] font-medium text-positive border border-positive/30 hover:bg-positive/15 hover:border-positive/50 rounded-lg px-2.5 py-1 transition-all duration-200 hover:shadow-[0_0_8px_rgba(52,211,153,0.1)]"
    >
      <span className="flex items-center gap-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        Bajarildi
      </span>
    </button>
    <button
      onClick={(e) => { e.stopPropagation(); onCancel(); }}
      className="text-[11px] font-medium text-negative border border-negative/30 hover:bg-negative/15 hover:border-negative/50 rounded-lg px-2.5 py-1 transition-all duration-200 hover:shadow-[0_0_8px_rgba(248,113,113,0.1)]"
    >
      <span className="flex items-center gap-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
        Bekor
      </span>
    </button>
  </div>
);
