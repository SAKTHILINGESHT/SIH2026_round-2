import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite configuration for standalone Applicant Institution Portal (Port 3051)
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 3051,
    strictPort: true,
    proxy: {
      '/api/deficiencies': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true
      }
    }
  }
})
