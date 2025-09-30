import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5090',
        changeOrigin: true,
        // Keep the '/api' prefix to match backend routes
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
