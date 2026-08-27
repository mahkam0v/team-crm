export const PendingActions = ({ onComplete, onCancel }) => (
  <div className="flex gap-1.5 shrink-0">
    <button
      onClick={(e) => { e.stopPropagation(); onComplete(); }}
      className="text-[11px] font-medium text-positive border border-positive/30 hover:bg-positive/10 rounded px-2 py-1 transition-colors"
    >
      Bajarildi
    </button>
    <button
      onClick={(e) => { e.stopPropagation(); onCancel(); }}
      className="text-[11px] font-medium text-negative border border-negative/30 hover:bg-negative/10 rounded px-2 py-1 transition-colors"
    >
      Bekor qilish
    </button>
  </div>
);
