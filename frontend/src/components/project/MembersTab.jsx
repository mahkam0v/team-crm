import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { Avatar, statusLabel } from '../Avatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const MembersTab = ({ projectId, project, onChanged }) => {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [directory, setDirectory] = useState([]);
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');

  const load = () => api.getProjectMembers(projectId).then((r) => setMembers(r.members)).finally(() => setLoading(false));

  useEffect(() => {
    load();
    api.userDirectory().then((r) => setDirectory(r.users));
  }, [projectId]);

  const canManage = project.ownerId === currentUser.id || ['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role);
  const availableToAdd = directory.filter((u) => !members.some((m) => m.userId === u.id));

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    if (!selected) return;
    try {
      await api.addProjectMember(projectId, selected);
      setSelected('');
      load();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemove = async (userId) => {
    await api.removeProjectMember(projectId, userId);
    load();
    onChanged?.();
  };

  return (
    <div>
      {canManage && (
        <form onSubmit={handleAdd} className="card mb-4">
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-3">A'zo qo'shish</h2>
          {error && <p className="text-negative text-[12.5px] mb-2">{error}</p>}
          <div className="flex gap-2">
            <select className="field mb-0" value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">Foydalanuvchi tanlang</option>
              {availableToAdd.map((u) => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
            <button className="btn-primary shrink-0">Qo'shish</button>
          </div>
        </form>
      )}

      <div className="card">
        {loading ? (
          <p className="text-muted text-sm py-4">Yuklanmoqda...</p>
        ) : (
          members.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <Avatar username={m.username} size={8} showStatus={m.status} />
                <div>
                  <div className="text-[13.5px] font-medium">{m.username}</div>
                  <div className="text-[11.5px] text-muted">
                    {m.isOwner ? 'Owner' : "A'zo"} · {statusLabel[m.status] || 'Offline'}
                  </div>
                </div>
              </div>
              {canManage && !m.isOwner && (
                <button onClick={() => handleRemove(m.userId)} className="text-[12px] text-negative hover:underline">
                  Olib tashlash
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
