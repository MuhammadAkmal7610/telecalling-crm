import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://wewave-backend.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'https://wewave-backend.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})