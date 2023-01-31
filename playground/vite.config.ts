import { URL, fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  server: {
    host: '0.0.0.0',
    cors: !!1,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@bluryar/composables': fileURLToPath(new URL('../packages/composables', import.meta.url)),
      '@bluryar/shared': fileURLToPath(new URL('../packages/shared', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['@bluryar/composables', '@bluryar/shared'],
  },
})
