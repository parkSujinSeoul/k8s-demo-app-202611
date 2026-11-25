import { useEffect, useState } from 'react';

// nginx가 제공하는 /api/info (버전, 빌드 태그, Pod 이름)를 표시한다.
// NodePort / Istio v1·v2 / 자동 배포 시연에서 "어느 Pod, 어느 빌드가 응답했는지" 보여 주는 용도.
// 로컬 개발 서버(npm run dev)에는 이 API가 없으므로 아무것도 표시하지 않는다.
export default function DeployInfo() {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    let alive = true;
    fetch('./api/info', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d && d.version) setInfo(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  if (!info) return null;
  return (
    <span className="pill p-good" title={`pod: ${info.pod}`}>
      {info.version} · build {info.build} · {info.pod}
    </span>
  );
}
