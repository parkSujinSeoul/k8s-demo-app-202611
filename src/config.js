// CI/CD 자동 배포 시연용 문구.
// 이 값을 바꿔서 push하면 Jenkins → Docker Hub → manifest 갱신 → ArgoCD 순서로 자동 배포되고,
// 첫 화면 상단의 "릴리스" 표시와 빌드 번호가 바뀐 것으로 배포를 확인할 수 있다.
export const RELEASE_NOTE = '자동 배포 v2';
