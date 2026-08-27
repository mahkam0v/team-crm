import { useEffect, useRef, useState } from 'react';
import { api } from '../../api.js';

const fileIcon = (mime = '') => {
  if (mime.includes('pdf')) return '📄';
  if (mime.includes('image')) return '🖼️';
  if (mime.includes('sheet') || mime.includes('excel')) return '📊';
  if (mime.includes('word') || mime.includes('document')) return '📝';
  return '📎';
};

export const FilesTab = ({ entityType, entityId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const load = () => api.listFiles(entityType, entityId).then((r) => setFiles(r.files)).finally(() => setLoading(false));
  useEffect(() => { load(); }, [entityType, entityId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.uploadFile(entityType, entityId, file);
      load();
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted">Fayllar</h2>
        <label className="btn-primary cursor-pointer">
          {uploading ? 'Yuklanmoqda...' : 'Fayl yuklash'}
          <input ref={inputRef} type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <p className="text-muted text-sm py-4">Yuklanmoqda...</p>
      ) : files.length === 0 ? (
        <p className="text-muted text-sm py-6 text-center">Hali fayl yo'q</p>
      ) : (
        files.map((f) => (
          <div key={f.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[16px]">{fileIcon(f.mimeType)}</span>
              <span className="text-[13px] truncate">{f.originalName}</span>
            </div>
            <button
              onClick={() => api.downloadFile(f.id, f.originalName)}
              className="text-[12px] text-accent hover:underline shrink-0"
            >
              Yuklab olish
            </button>
          </div>
        ))
      )}
    </div>
  );
};
