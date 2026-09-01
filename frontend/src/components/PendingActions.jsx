import { Icon } from './Icon.jsx';

export const PendingActions = ({ onComplete, onCancel }) => (
  <div className="flex gap-1 shrink-0">
    <button
      onClick={(e) => { e.stopPropagation(); onComplete(); }}
      className="text-[10.5px] font-medium text-positive border border-positive/20 hover:bg-positive/10 rounded-md px-2 py-1 transition-colors flex items-center gap-1"
    >
      <Icon name="check" className="w-2.5 h-2.5" strokeWidth={2.5} />
      Bajarildi
    </button>
    <button
      onClick={(e) => { e.stopPropagation(); onCancel(); }}
      className="text-[10.5px] font-medium text-negative border border-negative/20 hover:bg-negative/10 rounded-md px-2 py-1 transition-colors flex items-center gap-1"
    >
      <Icon name="x" className="w-2.5 h-2.5" strokeWidth={2.5} />
      Bekor
    </button>
  </div>
);
