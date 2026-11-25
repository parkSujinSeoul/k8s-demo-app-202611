// 메모는 브라우저 localStorage에 저장한다(서버 저장소 없음).
// Pod가 교체되어도 같은 브라우저에서는 메모가 유지된다.
const KEY = 'memo.items.v1';
const KEY_THEME = 'memo.theme';

function read(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v == null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 공간이 없거나 막힌 경우: 화면 상태만 유지한다.
  }
}

export const loadMemos = () => read(KEY, []);
export const saveMemos = (memos) => write(KEY, memos);
export const loadTheme = () => (read(KEY_THEME, 'light') === 'dark' ? 'dark' : 'light');
export const saveTheme = (t) => write(KEY_THEME, t);

export const newId = () =>
  (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));

export function fmtTime(ts) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
