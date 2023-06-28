import { defineConfig, presetUno } from 'unocss';
import { presetNaiveThemes } from '@bluryar/naive-ui-themes';
import '@unocss/core';

console.log(presetNaiveThemes)

export default (async () => {
  // const themesPreset = await presetNaiveThemes({ ...{
  //   patterns: ['*.(light|dark).(json|js|ts)', '(light|dark).(json|js|ts)'],
  //   dir: './src/themes',
  //   dts: './src/types/auto-naive-theme.d.ts',
  // }, autoimportThemes: !!1 })

  return defineConfig({
    presets: [
      // tryRemoveThemeVariant(
        presetUno()
      // ), 
      // themesPreset
    ],
  });
})();
