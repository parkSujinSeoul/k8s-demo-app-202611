import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' : 자산을 상대 경로로 불러온다.
// Istio가 /v2/ 경로를 v2로 보내면서 / 로 rewrite해도 /v2/assets/... 로 요청되어 같은 버전에서 받아진다.
export default defineConfig({
  base: './',
  plugins: [react()],
});
