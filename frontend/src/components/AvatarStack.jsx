import { Avatar } from './Avatar.jsx';

export const AvatarStack = ({ members = [], max = 4 }) => {
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((m, i) => (
        <div
          key={m.userId || i}
          className="ring-2 ring-surface rounded-full hover:ring-accent/30 hover:z-10 transition-all duration-150 hover:scale-105"
          title={m.username}
          style={{ zIndex: max - i }}
        >
          <Avatar username={m.username || '?'} size={6} />
        </div>
      ))}
      {extra > 0 && (
        <div className="w-6 h-6 rounded-full bg-white/[0.04] ring-2 ring-surface flex items-center justify-center text-[8.5px] text-muted/50 font-medium hover:bg-accent/15 hover:text-accent transition-colors">
          +{extra}
        </div>
      )}
    </div>
  );
};
