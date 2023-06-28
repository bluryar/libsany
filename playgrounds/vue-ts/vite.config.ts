import { URL, fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import Unocss from '@unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import Inspect from 'vite-plugin-inspect/dist/index';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

dotenv.config({ path: '../../.env' });

const fileReaderOptions = {
  patterns: ['*.(light|dark).(json|js|ts)', '(light|dark).(json|js|ts)'],
  dir: './src/themes',
  dts: './src/types/auto-naive-theme.d.ts',
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    Unocss(),
    // naiveMultiTheme({ ...fileReaderOptions }),
    Inspect(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core',
        {
          'vue-request': ['useRequest'],
        },
      ],
      dts: 'src/types/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
      },
    }),
    Components({
      // globs: ['src/components/*.{vue}'],
      dirs: ['src/components'],
      deep: !!0,
      resolvers: [NaiveUiResolver()],
      dts: 'src/types/components.d.ts',
    }),
  ],
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
