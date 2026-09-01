import { useEffect, useRef, useState } from 'react';
import { api } from '../../api.js';
import { Icon } from '../Icon.jsx';

const fileIcon = (mime = '') => {
  if (mime.includes('pdf')) return 'file_text';
  if (mime.includes('image')) return 'image';
  if (mime.includes('sheet') || mime.includes('excel')) return 'bar_chart';
  if (mime.includes('word') || mime.includes('document')) return 'file_text';
  return 'paperclip';
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
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-heading"><h2>Fayllar</h2></h2>
        <label className="btn-primary cursor-pointer text-[12px]">
          {uploading ? 'Yuklanmoqda...' : 'Fayl yuklash'}
          <input ref={inputRef} type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <p className="text-muted/50 text-[12.5px] py-4">Yuklanmoqda...</p>
      ) : files.length === 0 ? (
        <p className="text-muted/30 text-[12.5px] py-6 text-center">Hali fayl yo'q</p>
      ) : (
        files.map((f) => (
          <div key={f.id} className="flex items-center justify-between py-2.5 border-b border-white/[0.03] last:border-0 group hover:bg-white/[0.02] px-2 -mx-2 rounded-lg transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-white/[0.03] flex items-center justify-center shrink-0">
                <Icon name={fileIcon(f.mimeType)} className="w-3.5 h-3.5 text-muted/40" />
              </div>
              <span className="text-[12.5px] truncate text-white/70">{f.originalName}</span>
            </div>
            <button
              onClick={() => api.downloadFile(f.id, f.originalName)}
              className="text-[11px] text-accent hover:text-accent-light transition-colors shrink-0 flex items-center gap-1"
            >
              <Icon name="download" className="w-3 h-3" />
              Yuklab olish
            </button>
          </div>
        ))
      )}
    </div>
  );
};
