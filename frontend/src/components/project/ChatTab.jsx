import { useEffect, useRef, useState } from 'react';
import { api } from '../../api.js';
import { Avatar } from '../Avatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const QUICK_EMOJI = ['👍', '🎉', '✅', '🔥', '👀', '🙏'];

const formatTime = (d) => new Date(d).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

const renderMessage = (text) =>
  text.split(/(@[a-zA-Z0-9_]{3,32})/g).map((part, i) =>
    part.startsWith('@') ? (
      <span key={i} className="text-accent font-medium">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );

export const ChatTab = ({ projectId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [directory, setDirectory] = useState([]);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  const load = () => api.getProjectChat(projectId).then((r) => setMessages(r.messages)).finally(() => setLoading(false));

  useEffect(() => {
    load();
    api.userDirectory().then((r) => setDirectory(r.users));
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    localStorage.setItem(`chat-seen-${projectId}`, String(messages.length));
  }, [messages]);

  const handleTextChange = (e) => {
    const value = e.target.value;
    setText(value);
    const match = value.match(/@([a-zA-Z0-9_]{0,32})$/);
    setMentionQuery(match ? match[1] : null);
  };

  const insertMention = (username) => {
    setText((t) => t.replace(/@([a-zA-Z0-9_]{0,32})$/, `@${username} `));
    setMentionQuery(null);
  };

  const insertEmoji = (emoji) => setText((t) => `${t}${emoji}`);

  const handleSend = async () => {
    if (!text.trim()) return;
    const { message } = await api.sendProjectChat(projectId, text);
    setMessages((m) => [...m, message]);
    setText('');
    setMentionQuery(null);
  };

  const handleAttach = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.uploadFile('PROJECT', projectId, file);
      const { message } = await api.sendProjectChat(projectId, `📎 ${file.name} biriktirildi (Fayllar bo'limida)`);
      setMessages((m) => [...m, message]);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const filteredDirectory = mentionQuery !== null
    ? directory.filter((u) => u.username.toLowerCase().startsWith(mentionQuery.toLowerCase())).slice(0, 5)
    : [];

  return (
    <div className="card flex flex-col h-[560px]">
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {loading ? (
          <p className="text-muted text-sm">Yuklanmoqda...</p>
        ) : messages.length === 0 ? (
          <p className="text-muted text-sm text-center py-10">Hali xabar yo'q — birinchi bo'lib yozing</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="flex gap-2.5">
              <Avatar username={m.authorUsername || '?'} size={7} />
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-[13px] font-semibold">{m.authorUsername}</span>
                  <span className="text-[11px] text-muted">{formatTime(m.createdAt)}</span>
                  {m.editedAt && <span className="text-[10px] text-muted">(tahrirlangan)</span>}
                </div>
                <p className="text-[13px] text-white/90 break-words">{renderMessage(m.message)}</p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="relative pt-3 border-t border-border mt-3">
        {filteredDirectory.length > 0 && (
          <div className="absolute bottom-full left-0 mb-1 w-56 bg-raised border border-border rounded shadow-xl overflow-hidden">
            {filteredDirectory.map((u) => (
              <button
                key={u.id}
                onClick={() => insertMention(u.username)}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12.5px] hover:bg-surface text-left"
              >
                <Avatar username={u.username} size={5} />
                {u.username}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 mb-2">
          {QUICK_EMOJI.map((e) => (
            <button key={e} onClick={() => insertEmoji(e)} className="text-[15px] hover:scale-110 transition-transform">
              {e}
            </button>
          ))}
          <label className="ml-1 cursor-pointer text-muted hover:text-white p-1">
            {uploading ? '⏳' : '📎'}
            <input ref={fileRef} type="file" className="hidden" onChange={handleAttach} disabled={uploading} />
          </label>
        </div>

        <div className="flex gap-2">
          <input
            className="field mb-0"
            placeholder="Xabar yozing... @ bilan mention qiling"
            value={text}
            onChange={handleTextChange}
            onKeyDown={(e) => e.key === 'Enter' && !mentionQuery && handleSend()}
          />
          <button onClick={handleSend} className="btn-primary shrink-0">Yuborish</button>
        </div>
      </div>
    </div>
  );
};
