import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { Icon } from '../Icon.jsx';

const ACTION_ICON = {
  PROJECT_CREATED: 'folder',
  PROJECT_UPDATED: 'edit',
  PROJECT_MEMBER_ADDED: 'users',
  TASK_CREATED: 'clipboard',
  TASK_UPDATED: 'edit',
  TASK_COMPLETED: 'check_circle',
  INCOME_ADDED: 'trending_up',
  EXPENSE_ADDED: 'trending_down',
};

const ACTION_COLOR = {
  PROJECT_CREATED: 'text-accent',
  PROJECT_UPDATED: 'text-info',
  PROJECT_MEMBER_ADDED: 'text-teal',
  TASK_CREATED: 'text-accent',
  TASK_UPDATED: 'text-info',
  TASK_COMPLETED: 'text-positive',
  INCOME_ADDED: 'text-positive',
  EXPENSE_ADDED: 'text-warning',
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
      <h2 className="section-heading"><h2>Loyiha faoliyati</h2></h2>
      <p className="text-[11px] text-muted/40 mb-3">Tizim tomonidan qayd etilgan amallar — chatdan alohida</p>

      {loading ? (
        <p className="text-muted/50 text-[12.5px] py-4">Yuklanmoqda...</p>
      ) : logs.length === 0 ? (
        <p className="text-muted/30 text-[12.5px] py-6 text-center">Hali faoliyat yo'q</p>
      ) : (
        <div className="space-y-0">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2.5 py-2.5 border-b border-white/[0.03] last:border-0">
              <div className={`w-6 h-6 rounded-md bg-white/[0.03] flex items-center justify-center shrink-0 mt-0.5 ${ACTION_COLOR[log.action] || 'text-muted/40'}`}>
                <Icon name={ACTION_ICON[log.action] || 'more_horizontal'} className="w-3 h-3" strokeWidth={1.8} />
              </div>
              <div className="text-[12px]">
                <span className="font-medium text-white/70">{log.actorUsername || 'Kimdir'}</span>{' '}
                <span className="text-muted/50">{ACTION_LABEL[log.action] || log.action.toLowerCase().replaceAll('_', ' ')}</span>
                <span className="text-[10.5px] text-muted/30 ml-2">{new Date(log.createdAt).toLocaleString('uz-UZ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
