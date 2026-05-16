import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    // gzip 후 ~180KB 수준의 메인 번들은 React 앱 entry 로 무난한 크기라
    // 경고 임계치를 700KB 로 올려둡니다. 더 커지면 manualChunks 로 벤더를 분리하면 됩니다.
    chunkSizeWarningLimit: 700,
    // 청크 파일 이름을 해시로만 출력해서 컴포넌트/페이지 이름이 빌드 산출물에 노출되지
    // 않도록 합니다. 일반 사용자가 네트워크 탭이나 메인 번들에서 admin 페이지 구조를
    // 추정하지 못하게 하는 추가 보호.
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[hash].js',
        chunkFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash][extname]',
      },
    },
  },
});
