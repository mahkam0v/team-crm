import { useEffect, useState } from 'react';
import { api } from '../../api.js';

export const CalendarTab = ({ project, projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    api.listTasks(projectId).then((r) => setTasks(r.tasks.filter((t) => t.dueDate)));
    api.getProjectTransactions(projectId).then((r) => setTransactions(r.transactions.filter((t) => t.status === 'PENDING')));
  }, [projectId]);

  const events = [
    ...(project.deadline ? [{ type: 'Loyiha muddati', date: project.deadline, label: project.name, tone: 'text-negative' }] : []),
    ...tasks.map((t) => ({ type: 'Vazifa muddati', date: t.dueDate, label: t.title, tone: 'text-accent' })),
    ...transactions.map((t) => ({
      type: t.type === 'INCOME' ? 'Kutilayotgan daromad' : 'Kutilayotgan xarajat',
      date: t.date,
      label: `${Number(t.amount).toLocaleString()} so'm`,
      tone: t.type === 'INCOME' ? 'text-positive' : 'text-warning',
    })),
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="card">
      <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-1">Yaqinlashayotgan sanalar</h2>
      {events.length === 0 ? (
        <p className="text-muted text-sm py-6 text-center">Hech qanday sana yo'q</p>
      ) : (
        events.map((e, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div>
              <div className="text-[13px]">{e.label}</div>
              <div className={`text-[11px] mt-0.5 ${e.tone}`}>{e.type}</div>
            </div>
            <span className="num text-[12.5px] text-muted">{new Date(e.date).toLocaleDateString('uz-UZ')}</span>
          </div>
        ))
      )}
    </div>
  );
};
