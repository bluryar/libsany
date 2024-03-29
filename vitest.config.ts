import 'dotenv/config';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { commonDark, commonLight } from 'naive-ui';

export default defineConfig({
  plugins: [vue(), vueJsx()],
  define: {
    __DEV__: JSON.stringify('false'),
    BMAP_AK: JSON.stringify(process.env.BMAP_AK || ''),
    commonDark: JSON.stringify(commonDark),
    commonLight: JSON.stringify(commonLight),
  },
  resolve: {
    alias: {
      '@bluryar/shared': './packages/shared/index.ts',
      '@bluryar/shared/*': './packages/shared/*',
      '@bluryar/composables': './packages/composables/index.ts',
      '@bluryar/composables/*': './packages/composables/*',
    },
  },
  test: {
    includeSource: ['src/**/*.{js,tsx,jsx,tsx,vue}'],
    setupFiles: [resolve(__dirname, 'packages/.test/setup.ts')],
    environment: 'jsdom',
    deps: {
      inline: ['msw'],
    },
  },
});
