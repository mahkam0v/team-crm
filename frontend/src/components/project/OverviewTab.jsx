import { StatCard } from '../StatCard.jsx';

export const OverviewTab = ({ project }) => {
  const { finance, progress, budget } = project;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="section-heading"><h2>Progress</h2></h2>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12.5px] text-white/70">{progress.completed} / {progress.total} vazifa bajarildi</span>
            <span className="num text-[12.5px] text-accent font-semibold">{progress.progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress.progress}%` }} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="section-heading"><h2>Moliya</h2></h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Haqiqiy daromad" value={finance.actualIncome} tone="positive" />
          <StatCard label="Haqiqiy xarajat" value={finance.actualExpense} tone="negative" />
          <StatCard label="Foyda" value={finance.actualProfit} tone={finance.actualProfit >= 0 ? 'positive' : 'negative'} />
          <StatCard label="Kutilayotgan foyda" value={finance.expectedProfit} tone="warning" />
        </div>
      </div>

      <div>
        <h2 className="section-heading"><h2>Byudjet</h2></h2>
        <div className="card">
          <div className="flex items-center justify-between text-[12.5px] mb-2">
            <span className="text-muted/50">Sarflangan</span>
            <span className="num text-white/70">
              {budget.spent.toLocaleString()} / {budget.total.toLocaleString()} so'm
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${budget.exceeded ? 'bg-negative' : 'bg-positive'}`}
              style={{ width: `${budget.total > 0 ? Math.min(100, (budget.spent / budget.total) * 100) : 0}%` }}
            />
          </div>
          {budget.exceeded && (
            <p className="text-negative/80 text-[11.5px] mt-2">
              Byudjetdan {Math.abs(budget.remaining).toLocaleString()} so'mga oshib ketdi
            </p>
          )}
        </div>
      </div>

      {project.description && (
        <div>
          <h2 className="section-heading"><h2>Tavsif</h2></h2>
          <div className="card text-[12.5px] text-muted/60 leading-relaxed">{project.description}</div>
        </div>
      )}
    </div>
  );
};
