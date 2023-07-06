import 'dotenv/config';

import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineBuildConfig } from 'unbuild';

const isDevelopment = process.env.NODE_ENV === 'development';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineBuildConfig({
  entries: ['src/index', 'src/naive-multi-theme', 'src/preset-naive-themes', 'src/module-loader'],

  replace: {
    'import.meta.vitest': 'undefined',
    __DEV__: JSON.stringify(isDevelopment),
  },

  declaration: !!1,

  clean: true,

  alias: {
    '@bluryar/shared': resolve(__dirname, '../shared/index.ts'),
  },

  rollup: {
    emitCJS: true,
    inlineDependencies: !!1,
  },

  externals: [
    'lodash',
    'unocss',
    '@unocss/core',
    'vite',
    '@unocss/preset-mini',
    // '@unocss/preset-mini/utils',
    'fast-glob',
    'mlly',
    'naive-ui',
    'esbuild',
  ],
});
