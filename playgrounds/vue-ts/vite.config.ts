import { URL, fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import { defineConfig } from 'vite';
import UnoVitePlugin from '@unocss/vite';
import Inspect from 'vite-plugin-inspect';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { naiveMultiTheme, unsafeFileReaderSync } from '@bluryar/naive-ui-themes';

import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import { fileReaderOptions, selectorOptions } from './unocss.config';

dotenv.config({ path: '../../.env' });

// https://vitejs.dev/config/
export default defineConfig(() => {
  const { files } = unsafeFileReaderSync({ ...fileReaderOptions, parse: !!0 });

  return {
    define: {
      __DEV__: JSON.stringify(true),
      BMAP_AK: JSON.stringify(process.env.BMAP_AK || ''),
    },
    resolve: {
      alias: {
        lodash: 'lodash-es',
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@bluryar/shared': fileURLToPath(new URL('../../packages/shared/index.ts', import.meta.url)),
        '@bluryar/composables': fileURLToPath(new URL('../../packages/composables/index.ts', import.meta.url)),
        '@bluryar/naive-ui-themes': fileURLToPath(new URL('../../packages/naive-ui-themes/index.ts', import.meta.url)),
      },
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', 'lodash', 'lodash-es'],
    },
    plugins: [
      vue(),
      vueJsx(),
      UnoVitePlugin({
        configDeps: [...files],
      }),
      naiveMultiTheme({
        dts: './src/types/auto-naive-theme.d.ts',
        ...selectorOptions,
        ...fileReaderOptions,
      }),

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
  };
});
