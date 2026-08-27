import { Avatar } from './Avatar.jsx';

export const AvatarStack = ({ members = [], max = 4 }) => {
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((m, i) => (
        <div key={m.userId || i} className="ring-2 ring-surface rounded-full" title={m.username}>
          <Avatar username={m.username || '?'} size={6} />
        </div>
      ))}
      {extra > 0 && (
        <div className="w-6 h-6 rounded-full bg-raised ring-2 ring-surface flex items-center justify-center text-[9px] text-muted font-medium">
          +{extra}
        </div>
      )}
    </div>
  );
};
