import { useNavigate } from 'react-router-dom';
import { StatusBadge } from './StatusBadge.jsx';
import { AvatarStack } from './AvatarStack.jsx';
import { Icon } from './Icon.jsx';

const iconPalette = [
  'bg-accent/10 text-accent',
  'bg-positive/10 text-positive',
  'bg-warning/10 text-warning',
  'bg-info/10 text-info',
  'bg-teal/10 text-teal',
  'bg-rose/10 text-rose',
];
const iconFor = (name) => iconPalette[name.charCodeAt(0) % iconPalette.length];

export const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/projects/${project.id}`)}
      className="text-left card hover:border-accent/20 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer w-full group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-[12px] ${iconFor(project.name)} group-hover:scale-105 transition-transform duration-200`}>
          {project.name.slice(0, 2).toUpperCase()}
        </div>
        <StatusBadge status={project.status} small />
      </div>

      <div className="text-[13.5px] font-semibold mb-1 truncate text-white/85 group-hover:text-white transition-colors">{project.name}</div>
      {project.description && (
        <p className="text-[11.5px] text-muted/50 mb-3 line-clamp-2 leading-relaxed">{project.description}</p>
      )}

      <div className="mb-3">
        <div className="flex items-center justify-between text-[10.5px] text-muted/40 mb-1.5">
          <span>Progress</span>
          <span className="num text-white/70 font-semibold">{project.progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-700 ease-out"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <AvatarStack members={project.members} />
        {project.deadline && (
          <span className="text-[10px] text-muted/30 font-mono flex items-center gap-1">
            <Icon name="calendar" className="w-2.5 h-2.5" />
            {new Date(project.deadline).toLocaleDateString('uz-UZ')}
          </span>
        )}
      </div>

      {project.finance && (
        <div className={`mt-3 pt-3 border-t border-white/[0.04] text-[12px] num font-semibold ${project.finance.actualProfit >= 0 ? 'text-positive' : 'text-negative'}`}>
          {project.finance.actualProfit >= 0 ? '+' : ''}{project.finance.actualProfit.toLocaleString()} <span className="text-[10px] text-muted/30 font-normal">so'm</span>
        </div>
      )}
    </button>
  );
};
