import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // The preview environment is reached through a dynamic proxy host, so the
    // dev server must accept hosts other than localhost.
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
