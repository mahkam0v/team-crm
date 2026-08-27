import { useEffect, useState } from 'react';
import { api } from '../../api.js';

export const NotesTab = ({ projectId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');

  const load = () => api.listNotes({ projectId }).then((r) => setNotes(r.notes)).finally(() => setLoading(false));
  useEffect(() => { load(); }, [projectId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    await api.createNote({ content, projectId });
    setContent('');
    load();
  };

  const handleDelete = async (id) => {
    await api.deleteNote(id);
    setNotes((n) => n.filter((note) => note.id !== id));
  };

  return (
    <div>
      <form onSubmit={handleAdd} className="card mb-4">
        <textarea
          className="field"
          rows={3}
          placeholder="Eslatma yozing — talablar, uchrashuv qaydlari, g'oyalar..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button className="btn-primary">Qo'shish</button>
      </form>

      {loading ? (
        <p className="text-muted text-sm py-4">Yuklanmoqda...</p>
      ) : notes.length === 0 ? (
        <p className="text-muted text-sm py-6 text-center">Hali eslatma yo'q</p>
      ) : (
        <div className="space-y-2">
          {notes.map((n) => (
            <div key={n.id} className="card flex items-start justify-between gap-3">
              <div>
                <p className="text-[13.5px] whitespace-pre-wrap">{n.content}</p>
                <p className="text-[11px] text-muted mt-1.5">{new Date(n.createdAt).toLocaleString('uz-UZ')}</p>
              </div>
              <button onClick={() => handleDelete(n.id)} className="text-negative text-[12px] shrink-0 hover:underline">
                O'chirish
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
