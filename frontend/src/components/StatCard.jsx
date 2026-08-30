export const StatCard = ({ label, value, tone = 'default', suffix = "so'm", onClick, hint }) => {
  const toneClasses = {
    positive: 'text-positive border-l-positive glow-positive',
    negative: 'text-negative border-l-negative glow-negative',
    warning: 'text-warning border-l-warning',
    default: 'text-white border-l-accent',
  }[tone];

  return (
    <div
      onClick={onClick}
      className={`
        card border-l-[3px] ${toneClasses.split(' ')[0]} ${toneClasses.split(' ')[1]}
        ${onClick ? 'cursor-pointer group' : ''}
      `}
      style={onClick ? { transition: 'all 0.3s ease' } : undefined}
    >
      <div
        className={`
          text-[11.5px] uppercase tracking-wide text-muted
          group-hover:text-white/80 transition-colors duration-200
        `}
      >
        {label}
      </div>
      <div className={`num text-[22px] mt-1.5 ${toneClasses.split(' ')[0]}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix && <span className="text-[13px] text-muted ml-1">{suffix}</span>}
      </div>
      {hint && (
        <div className="text-[11px] text-muted mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {hint}
        </div>
      )}
    </div>
  );
};
