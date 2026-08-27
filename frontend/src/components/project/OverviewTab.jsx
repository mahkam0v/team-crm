import { StatCard } from '../StatCard.jsx';

export const OverviewTab = ({ project }) => {
  const { finance, progress, budget } = project;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-2">Progress</h2>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px]">{progress.completed} / {progress.total} vazifa bajarildi</span>
            <span className="num text-[13px] text-accent">{progress.progress}%</span>
          </div>
          <div className="w-full h-2 bg-ink rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all" style={{ width: `${progress.progress}%` }} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-2">Moliya</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Haqiqiy daromad" value={finance.actualIncome} tone="positive" />
          <StatCard label="Haqiqiy xarajat" value={finance.actualExpense} tone="negative" />
          <StatCard label="Foyda" value={finance.actualProfit} tone={finance.actualProfit >= 0 ? 'positive' : 'negative'} />
          <StatCard label="Kutilayotgan foyda" value={finance.expectedProfit} tone="warning" />
        </div>
      </div>

      <div>
        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-2">Byudjet</h2>
        <div className="card">
          <div className="flex items-center justify-between text-[13px] mb-2">
            <span className="text-muted">Sarflangan</span>
            <span className="num">
              {budget.spent.toLocaleString()} / {budget.total.toLocaleString()} so'm
            </span>
          </div>
          <div className="w-full h-2 bg-ink rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${budget.exceeded ? 'bg-negative' : 'bg-positive'}`}
              style={{ width: `${budget.total > 0 ? Math.min(100, (budget.spent / budget.total) * 100) : 0}%` }}
            />
          </div>
          {budget.exceeded && (
            <p className="text-negative text-[12px] mt-2">
              Byudjetdan {Math.abs(budget.remaining).toLocaleString()} so'mga oshib ketdi
            </p>
          )}
        </div>
      </div>

      {project.description && (
        <div>
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-2">Tavsif</h2>
          <div className="card text-[13.5px] text-muted">{project.description}</div>
        </div>
      )}
    </div>
  );
};
