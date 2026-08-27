import { useEffect, useState } from 'react';
import { api } from '../../api.js';

const ACTION_ICON = {
  PROJECT_CREATED: '🆕',
  PROJECT_UPDATED: '✏️',
  PROJECT_MEMBER_ADDED: '👥',
  TASK_CREATED: '📋',
  TASK_UPDATED: '✏️',
  TASK_COMPLETED: '✅',
  INCOME_ADDED: '💰',
  EXPENSE_ADDED: '💸',
};

const ACTION_LABEL = {
  PROJECT_CREATED: 'loyihani yaratdi',
  PROJECT_UPDATED: 'loyihani yangiladi',
  PROJECT_MEMBER_ADDED: "a'zo qo'shdi",
  TASK_CREATED: 'vazifa yaratdi',
  TASK_UPDATED: 'vazifani yangiladi',
  TASK_COMPLETED: 'vazifani bajardi',
  INCOME_ADDED: "daromad qo'shdi",
  EXPENSE_ADDED: "xarajat qo'shdi",
};

export const ActivityTab = ({ projectId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjectActivity(projectId).then((r) => setLogs(r.logs)).finally(() => setLoading(false));
  }, [projectId]);

  return (
    <div className="card">
      <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-1">Loyiha faoliyati</h2>
      <p className="text-[11.5px] text-muted mb-3">Tizim tomonidan qayd etilgan amallar — chatdan alohida</p>

      {loading ? (
        <p className="text-muted text-sm py-4">Yuklanmoqda...</p>
      ) : logs.length === 0 ? (
        <p className="text-muted text-sm py-6 text-center">Hali faoliyat yo'q</p>
      ) : (
        <div className="space-y-0">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
              <span className="text-[14px] mt-0.5">{ACTION_ICON[log.action] || '•'}</span>
              <div className="text-[13px]">
                <span className="font-medium">{log.actorUsername || 'Kimdir'}</span>{' '}
                <span className="text-muted">{ACTION_LABEL[log.action] || log.action.toLowerCase().replaceAll('_', ' ')}</span>
                <span className="text-[11px] text-muted ml-2">{new Date(log.createdAt).toLocaleString('uz-UZ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
