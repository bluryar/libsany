import { presetUno } from '@unocss/preset-uno';
import type { UserConfig } from '@unocss/core';
import { useDialog } from '@bluryar/composables';

// import '@unocss/preset-mini';

import { unsafeFileReaderSync } from '@bluryar/naive-ui-themes/dist/fileReader';

console.log('🚀 ~ file: unocss.config.ts:4 ~ useDialog:', useDialog);

// import { presetNaiveThemes } from '@bluryar/naive-ui-themes/dist/presetNaiveThemes';

// import { naiveMultiTheme } from '@bluryar/naive-ui-themes/dist/naiveMultiTheme';

console.log('🚀 ~ file: unocss.config.ts:7 ~ unsafeFileReaderSync:', unsafeFileReaderSync);
// console.log('🚀 ~ file: unocss.config.ts:9 ~ presetNaiveThemes:', presetNaiveThemes);
// console.log('🚀 ~ file: unocss.config.ts:11 ~ naiveMultiTheme:', naiveMultiTheme);

const uno = presetUno();
const presetUnoRes = uno;
// const presetTheme = presetNaiveThemes();
// console.warn('🚀 ~ file: unocss.config.ts:13 ~ presetTheme:', presetTheme);

// const res = unsafeFileReaderSync({
//   dir: './src/themes',
//   parse: !!1,
// });
// console.log('🚀 ~ file: unocss.config.ts:21 ~ res:', res);

export default {
  presets: [presetUnoRes],
} satisfies UserConfig;
