import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue': 'vue/dist/vue.esm-bundler.js'
    },
  },
  server: {
    port: 3001,
    strictPort: false,
    host: true,
    allowedHosts: ['tezjumush-production.up.railway.app'],
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    }
  },
  // Define environment variables
  define: {
    'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify('655912811217-9dvofthoehrkkgp547dltgb9qb8tnckr.apps.googleusercontent.com')
  },
  build: {
    // Улучшенные настройки для хостинга
    outDir: 'dist',
    assetsDir: 'assets',
    // Генерировать исходные карты для отладки
    sourcemap: false,
    // Минимизировать build
    minify: 'terser',
    // Настройки CSS
    cssCodeSplit: true,
    // Оптимизировать для продакшена
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
        },
      },
    },
  },
})
