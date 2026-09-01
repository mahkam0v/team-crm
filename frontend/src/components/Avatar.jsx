const colors = ['bg-gradient-to-br from-accent to-accent-dim', 'bg-gradient-to-br from-positive to-emerald-600', 'bg-gradient-to-br from-warning to-amber-600', 'bg-gradient-to-br from-info to-sky-600', 'bg-gradient-to-br from-rose to-pink-600'];

const colorFor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const statusDot = {
  AVAILABLE: 'bg-positive',
  BUSY: 'bg-warning',
  DO_NOT_DISTURB: 'bg-negative',
  OFFLINE: 'bg-muted/40',
};

export const Avatar = ({ username = '?', size = 8, showStatus = null }) => (
  <div className="relative inline-flex shrink-0" style={{ width: `${size * 4}px`, height: `${size * 4}px` }}>
    <div
      className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold ${colorFor(username)}`}
      style={{ fontSize: `${size * 1.5}px` }}
    >
      {username.slice(0, 1).toUpperCase()}
    </div>
    {showStatus && (
      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-[1.5px] border-surface ${statusDot[showStatus] || 'bg-muted/40'}`} />
    )}
  </div>
);

export const statusLabel = {
  AVAILABLE: 'Mavjud',
  BUSY: 'Band',
  DO_NOT_DISTURB: 'Bezovta qilmang',
  OFFLINE: 'Offline',
};
