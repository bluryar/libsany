import 'dotenv/config';

import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { commonDark, commonLight } from 'naive-ui';
import { defineBuildConfig } from 'unbuild';

const isDevelopment = process.env.NODE_ENV === 'development';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineBuildConfig({
  entries: ['src/index', 'src/naiveMultiTheme', 'src/presetNaiveThemes', 'src/fileReader'],

  replace: {
    'import.meta.vitest': 'undefined',
    __DEV__: JSON.stringify(isDevelopment),
    BMAP_AK: JSON.stringify(process.env.BMAP_AK || ''),
    commonDark: JSON.stringify(commonDark),
    commonLight: JSON.stringify(commonLight),
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

  externals: ['lodash-es', '@vueuse/core', '@unocss/core', '@unocss/preset-mini', '@unocss/preset-mini/utils'],
});
