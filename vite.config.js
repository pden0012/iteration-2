import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_TARGET || 'http://13.236.162.216:8080'
  return {
    base: '/',
    plugins: [
      vue(),
      {
        name: 'copy-redirects',
        generateBundle() {
          this.emitFile({
            type: 'asset',
            fileName: '_redirects',
            source: `# Render.com Static Site Rewrite Rules
# This file tells Render how to handle API requests

# Rewrite API requests to backend (remove /api prefix)
/api/map/* http://13.236.162.216:8080/map/:splat 200
/api/ai/* http://13.236.162.216:8080/ai/:splat 200`
          });
        }
      }
    ],
    server: {
      port: 3000,
      open: true,
      proxy: {
        // 本地开发代理，解决 CORS。前端请求 /api/* 会被转发到后端。
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets'
    },
    publicDir: 'public'
  }
})

