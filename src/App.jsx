import { useEffect, useMemo, useState } from 'react';
import { RELEASE_NOTE } from './config.js';
import { loadMemos, saveMemos, loadTheme, saveTheme, newId, fmtTime } from './storage.js';
import MemoForm from './components/MemoForm.jsx';
import DeployInfo from './components/DeployInfo.jsx';

export default function App() {
  const [theme, setTheme] = useState(loadTheme);
  const [memos, setMemos] = useState(loadMemos);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);
  useEffect(() => { saveMemos(memos); }, [memos]);

  const editing = memos.find((m) => m.id === editingId) ?? null;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...memos].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!q) return list;
    return list.filter((m) => (m.title + '\n' + m.body).toLowerCase().includes(q));
  }, [memos, query]);

  const save = ({ title, body }) => {
    const now = Date.now();
    if (editing) {
      setMemos((prev) => prev.map((m) => (m.id === editing.id ? { ...m, title, body, updatedAt: now } : m)));
      setEditingId(null);
    } else {
      setMemos((prev) => [{ id: newId(), title, body, createdAt: now, updatedAt: now }, ...prev]);
    }
  };

  const remove = (m) => {
    if (!confirm(`'${m.title || '제목 없음'}' 메모를 삭제할까요?`)) return;
    setMemos((prev) => prev.filter((x) => x.id !== m.id));
    if (editingId === m.id) setEditingId(null);
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => {
    const t = theme === 'dark' ? 'light' : 'dark';
    saveTheme(t);
    setTheme(t);
  };

  return (
    <>
      <header className="top">
        <div className="top-in">
          <b>메모장</b>
          <span className="pill p-good">릴리스: {RELEASE_NOTE}</span>
          <span className="sp" />
          <DeployInfo />
          <button className="b" type="button" onClick={toggleTheme}>{theme === 'dark' ? '☀ 밝게' : '☾ 어둡게'}</button>
        </div>
      </header>

      <main>
        <MemoForm initial={editing} onSave={save} onCancel={() => setEditingId(null)} />

        <div className="list-head">
          <h2>메모 {memos.length}개</h2>
          <input
            className="inp search"
            type="search"
            placeholder="검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {visible.length === 0 ? (
          <p className="empty muted">{memos.length === 0 ? '아직 메모가 없습니다. 위에서 첫 메모를 등록해 보세요.' : '검색 결과가 없습니다.'}</p>
        ) : (
          <ul className="memos">
            {visible.map((m) => (
              <li key={m.id} className={'panel memo' + (m.id === editingId ? ' on' : '')}>
                <div className="memo-head">
                  <b className="memo-title">{m.title || '제목 없음'}</b>
                  <span className="muted small">{fmtTime(m.updatedAt)}{m.updatedAt !== m.createdAt ? ' 수정' : ''}</span>
                </div>
                {m.body && <p className="memo-body">{m.body}</p>}
                <div className="row">
                  <button className="b" type="button" onClick={() => startEdit(m)}>수정</button>
                  <button className="b danger" type="button" onClick={() => remove(m)}>삭제</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
