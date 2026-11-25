import { useEffect, useRef, useState } from 'react';

// 새 메모 등록과 기존 메모 수정에 함께 쓰는 입력 폼.
export default function MemoForm({ initial, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const titleRef = useRef(null);
  const editing = Boolean(initial);

  useEffect(() => {
    setTitle(initial?.title ?? '');
    setBody(initial?.body ?? '');
    titleRef.current?.focus();
  }, [initial]);

  const canSave = title.trim() !== '' || body.trim() !== '';

  const submit = (e) => {
    e.preventDefault();
    if (!canSave) return;
    onSave({ title: title.trim(), body });
    if (!editing) { setTitle(''); setBody(''); }
  };

  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit(e);
    if (e.key === 'Escape' && editing) onCancel();
  };

  return (
    <form className="panel form" onSubmit={submit} onKeyDown={onKeyDown}>
      <h2>{editing ? '메모 수정' : '새 메모'}</h2>
      <input
        ref={titleRef}
        className="inp"
        placeholder="제목"
        value={title}
        maxLength={100}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="inp"
        placeholder="내용을 입력하세요"
        rows={6}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="row">
        <button className="b pri" type="submit" disabled={!canSave}>{editing ? '수정 저장' : '등록'}</button>
        {editing && <button className="b" type="button" onClick={onCancel}>취소</button>}
        <span className="muted small">Ctrl/⌘ + Enter로 저장</span>
      </div>
    </form>
  );
}
