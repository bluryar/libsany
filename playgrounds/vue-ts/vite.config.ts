import { URL, fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@bluryar/shared': fileURLToPath(new URL('../../packages/shared/index.ts', import.meta.url)),
      '@bluryar/composables': fileURLToPath(new URL('../../packages/composables/index.ts', import.meta.url)),
    },
  },
  define: {
    __DEV__: JSON.stringify(true),
  },
});
