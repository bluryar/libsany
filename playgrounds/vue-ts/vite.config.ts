import { URL, fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

dotenv.config({ path: '../../.env' });

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@bluryar/shared': fileURLToPath(new URL('../../packages/shared/', import.meta.url)),
      '@bluryar/composables': fileURLToPath(new URL('../../packages/composables/', import.meta.url)),
    },
  },
  define: {
    __DEV__: JSON.stringify(true),
    BMAP_AK: JSON.stringify(process.env.BMAP_AK || ''),
  },
});
