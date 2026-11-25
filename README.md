# k8s-demo-app (app-repo)

Kubernetes 구축·배포 실습용 React 웹 애플리케이션입니다. 메모를 등록·수정·삭제·검색할 수 있는 간단한 메모장입니다. 메모는 브라우저 localStorage에 저장됩니다(서버 저장소 없음).
배포 매니페스트는 [k8s-demo-manifests-202611](https://github.com/parkSujinSeoul/k8s-demo-manifests-202611)에 있습니다.

## 구성

```
k8s-demo-app-202611/
├── src/
│   ├── App.jsx                 메모 목록, 등록/수정/삭제, 검색
│   ├── config.js               RELEASE_NOTE: 자동 배포 시연 때 바꾸는 문구
│   ├── storage.js              localStorage 저장/불러오기
│   └── components/             MemoForm(등록·수정 폼), DeployInfo
├── nginx/default.conf.template /healthz, /api/info, SPA 라우팅
├── Dockerfile                  node:20 빌드 → nginx-unprivileged(8080, non-root)
└── Jenkinsfile                 빌드 → Docker Hub push → manifest 이미지 태그 갱신
```

## 엔드포인트

| 경로 | 내용 |
|---|---|
| `/` | React 앱 |
| `/api/info` | `{"version":"v1","build":"12-a1b2c3d","pod":"demo-app-v1-…"}` |
| `/healthz` | readiness / liveness probe |

화면 오른쪽 위에 `v1 · build 12-a1b2c3d · demo-app-v1-…` 표시가 나옵니다. 어느 버전, 어느 빌드, 어느 Pod가 응답했는지 화면에서 바로 확인할 수 있습니다.

## CI/CD 흐름

```
src/config.js의 RELEASE_NOTE 수정 → git push(app-repo)
  → Jenkins pollSCM(1분) 감지 → docker build → Docker Hub push (태그: 빌드번호-커밋)
  → manifest-repo deployment.yaml 이미지 태그 수정·push
  → ArgoCD 자동 Sync → 새 Pod 롤링 배포 → 화면의 릴리스 문구와 build 번호가 바뀜
```

GitHub에서 bastion(사설 IP)으로 webhook이 닿지 않아서 Poll SCM 방식을 사용합니다.

## 로컬 실행

```bash
npm install
npm run dev                      # http://localhost:5173 (개발 서버에는 /api/info 없음)

docker build --build-arg BUILD_TAG=local -t k8s-demo-app:test .
docker run --rm -p 8080:8080 -e APP_VERSION=v1 k8s-demo-app:test
curl localhost:8080/api/info
```

## 최초 이미지 등록 (v1)

ArgoCD가 처음 배포할 이미지를 미리 올려 둡니다.

```bash
docker login
docker build --build-arg BUILD_TAG=v1 -t docker.io/<DOCKERHUB_ID>/k8s-demo-app:v1 .
docker push docker.io/<DOCKERHUB_ID>/k8s-demo-app:v1
```

## Jenkins 준비

| 항목 | 값 |
|---|---|
| Credentials `dockerhub-cred` | Docker Hub 아이디 / Access Token |
| Credentials `github-cred` | GitHub 아이디 / Personal Access Token (repo 권한) |
| Job 종류 | Pipeline, SCM: 이 저장소 `main`, Script Path: `Jenkinsfile` |
| 권한 | `usermod -aG docker jenkins` 후 Jenkins 재시작 |

`Jenkinsfile`의 `DOCKERHUB_USER`를 본인 Docker Hub 아이디로 바꿔야 합니다. Node 빌드는 Docker 안에서 하므로 bastion에 Node를 설치할 필요는 없습니다.
