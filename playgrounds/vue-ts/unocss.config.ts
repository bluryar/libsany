import { defineConfig } from 'unocss';

import '@unocss/core';
import '@unocss/preset-mini';

import { presetUno } from '@unocss/preset-uno';
import { presetNaiveThemes, tryRemoveThemeVariant } from './node_modules/@bluryar/naive-ui-themes/dist/unocss-preset';

console.warn('🚀 ~ file: unocss.config.ts:8 ~ presetNaiveThemes:', presetNaiveThemes);
console.warn('🚀 ~ file: unocss.config.ts:8 ~ tryRemoveThemeVariant:', tryRemoveThemeVariant);

const presetTheme = presetNaiveThemes();
const presetUnoRes = tryRemoveThemeVariant(presetUno());
export default defineConfig({
  presets: [presetUnoRes, presetTheme],
});
