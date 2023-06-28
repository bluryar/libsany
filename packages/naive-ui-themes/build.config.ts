import 'dotenv/config';

import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineBuildConfig } from 'unbuild';

const isDevelopment = process.env.NODE_ENV === 'development';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineBuildConfig({
  entries: ['src/index', 'src/unocss-preset', 'src/vite-plugin', 'src/fileReader'],

  replace: {
    'import.meta.vitest': 'undefined',
    __DEV__: JSON.stringify(isDevelopment),
    BMAP_AK: JSON.stringify(process.env.BMAP_AK || ''),
  },

  declaration: !!1,

  clean: true,

  alias: {
    '@bluryar/shared': resolve(__dirname, '../shared/index.ts'),
  },

  rollup: {
    emitCJS: true,

    inlineDependencies: !!1,

    esbuild: {
      jsx: 'automatic',
    },
  },

  externals: [
    // 'vue',
    // 'lodash-es',
    // '@vueuse/core',
    // '@unocss/preset-mini',
    // 'vite',
    // 'unocss',
    // 'naive-ui',
    // 'fast-glob',
    // 'mlly',
    // 'esbuild',
  ],
});
