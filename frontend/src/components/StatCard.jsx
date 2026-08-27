export const StatCard = ({ label, value, tone = 'default', suffix = "so'm", onClick, hint }) => {
  const toneClass = { positive: 'text-positive', negative: 'text-negative', warning: 'text-warning', default: 'text-white' }[tone];
  const borderClass = { positive: 'border-l-positive', negative: 'border-l-negative', warning: 'border-l-warning', default: 'border-l-accent' }[tone];

  return (
    <div
      onClick={onClick}
      className={`card border-l-[3px] ${borderClass} ${
        onClick ? 'cursor-pointer hover:border-accent/60 hover:shadow-lg hover:-translate-y-0.5 transition-all' : ''
      }`}
    >
      <div className="text-[11.5px] uppercase tracking-wide text-muted">{label}</div>
      <div className={`num text-[22px] mt-1.5 ${toneClass}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix && <span className="text-[13px] text-muted ml-1">{suffix}</span>}
      </div>
      {hint && <div className="text-[11px] text-muted mt-1">{hint}</div>}
    </div>
  );
};
