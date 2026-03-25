import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Sur le web (Vercel), `base` doit être `/` : avec `./`, depuis une route comme `/client/home`
// le navigateur résout `./assets/*.js` vers `/client/assets/*.js` → 404 sur les chunks lazy-loadés.
// Build Android/Capacitor : `vite build --mode capacitor` garde `base: './'` pour le WebView.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'capacitor' ? './' : '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react'],
          api: ['axios', 'socket.io-client'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
}))




