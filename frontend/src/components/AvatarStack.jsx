import { Avatar } from './Avatar.jsx';

export const AvatarStack = ({ members = [], max = 4 }) => {
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((m, i) => (
        <div
          key={m.userId || i}
          className="ring-2 ring-surface rounded-full hover:ring-accent/50 hover:z-10 transition-all duration-200 hover:scale-110"
          title={m.username}
          style={{ zIndex: max - i }}
        >
          <Avatar username={m.username || '?'} size={6} />
        </div>
      ))}
      {extra > 0 && (
        <div className="w-6 h-6 rounded-full bg-raised ring-2 ring-surface flex items-center justify-center text-[9px] text-muted font-medium hover:bg-accent/20 hover:text-accent transition-colors duration-200">
          +{extra}
        </div>
      )}
    </div>
  );
};
