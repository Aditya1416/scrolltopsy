import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true,
    target: 'es2020',
    chunkSizeWarningLimit: 200,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('firebase/app')) return 'firebase-core';
          if (id.includes('firebase/auth')) return 'firebase-auth';
          if (id.includes('firebase/firestore')) return 'firebase-firestore';
          if (id.includes('node_modules')) return 'vendor';
        }
      }
    }
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
    exclude: ['@firebase/app-compat']
  }
})
