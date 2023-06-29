import { URL, fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import UnoVitePlugin from '@unocss/vite';

// import { naiveMultiTheme } from '@bluryar/naive-ui-themes/dist/naiveMultiTheme';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

// import unocssConfig from '';

dotenv.config({ path: '../../.env' });

const fileReaderOptions = {
  dir: './src/themes',
  dts: './src/types/auto-naive-theme.d.ts',
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    UnoVitePlugin(),
    // naiveMultiTheme({ ...fileReaderOptions }),

    // Inspect(),
    // AutoImport({
    //   imports: [
    //     'vue',
    //     'vue-router',
    //     'pinia',
    //     '@vueuse/core',
    //     {
    //       'vue-request': ['useRequest'],
    //     },
    //   ],
    //   dts: 'src/types/auto-imports.d.ts',
    //   eslintrc: {
    //     enabled: true,
    //     filepath: './.eslintrc-auto-import.json',
    //   },
    // }),
    // Components({
    //   // globs: ['src/components/*.{vue}'],
    //   dirs: ['src/components'],
    //   deep: !!0,
    //   resolvers: [NaiveUiResolver()],
    //   dts: 'src/types/components.d.ts',
    // }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@bluryar/shared': fileURLToPath(new URL('../../packages/shared/index.ts', import.meta.url)),
      '@bluryar/composables': fileURLToPath(new URL('../../packages/composables/index.ts', import.meta.url)),
      '@bluryar/naive-ui-themes': fileURLToPath(new URL('../../packages/naive-ui-themes/index.ts', import.meta.url)),
    },
  },
  define: {
    __DEV__: JSON.stringify(true),
    BMAP_AK: JSON.stringify(process.env.BMAP_AK || ''),
  },
});
