import { useNavigate } from 'react-router-dom';
import { StatusBadge } from './StatusBadge.jsx';
import { AvatarStack } from './AvatarStack.jsx';

const iconPalette = ['bg-accent/20 text-accent', 'bg-positive/20 text-positive', 'bg-warning/20 text-warning', 'bg-negative/20 text-negative'];
const iconFor = (name) => iconPalette[name.charCodeAt(0) % iconPalette.length];

export const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/projects/${project.id}`)}
      className="text-left card hover:border-accent/50 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer w-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-display font-semibold text-[13px] ${iconFor(project.name)}`}>
          {project.name.slice(0, 2).toUpperCase()}
        </div>
        <StatusBadge status={project.status} small />
      </div>

      <div className="text-[14px] font-semibold mb-1 truncate">{project.name}</div>
      {project.description && (
        <p className="text-[12px] text-muted mb-3 line-clamp-2">{project.description}</p>
      )}

      <div className="mb-3">
        <div className="flex items-center justify-between text-[11px] text-muted mb-1">
          <span>Progress</span>
          <span className="num text-white">{project.progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-ink rounded-full overflow-hidden">
          <div className="h-full bg-accent transition-all" style={{ width: `${project.progress}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <AvatarStack members={project.members} />
        <span className="text-[11px] text-muted">
          {project.deadline ? new Date(project.deadline).toLocaleDateString('uz-UZ') : "Muddatsiz"}
        </span>
      </div>

      {project.finance && (
        <div className={`mt-3 pt-3 border-t border-border text-[12px] num ${project.finance.actualProfit >= 0 ? 'text-positive' : 'text-negative'}`}>
          {project.finance.actualProfit >= 0 ? '+' : ''}{project.finance.actualProfit.toLocaleString()} so'm
        </div>
      )}
    </button>
  );
};
