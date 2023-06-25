import { createGenerator, presetUno } from 'unocss';
import { presetNaiveThemes } from './unocss-preset';
import type { Theme } from './types';

describe('presetNaiveThemes', () => {
  it('should generate CSS code for light and dark themes', async () => {
    const themes = [
      { name: 'default.light', isDark: false, themeOverride: {} },
      { name: 'default.dark', isDark: true, themeOverride: {} },
    ];
    const uno = createGenerator({
      presets: [presetUno(), presetNaiveThemes({ themes })],
    });
    const { css } = await uno.generate(['default.dark:bg-red-500']);
    expect(css).toContain('html .default .light');
    expect(css).toContain('html .default .dark');
    expect(css.split('\n').at(-1)).toMatchInlineSnapshot(
      '"html .default .dark .default\\\\.dark\\\\:bg-red-500{--un-bg-opacity:1;background-color:rgba(239,68,68,var(--un-bg-opacity));}"',
    );
  });

  it('should generate CSS code with custom selector and attribute', async () => {
    const themes = [
      { name: 'default.light', isDark: false, themeOverride: {} },
      { name: 'default.dark', isDark: true, themeOverride: {} },
    ];
    const uno = createGenerator({
      presets: [presetUno(), presetNaiveThemes({ themes, selector: 'body', attribute: 'data-theme' })],
    });
    const { css } = await uno.generate(['bg-red-500']);
    expect(css).toContain('body[data-theme="default.light"]');
    expect(css).toContain('body[data-theme="default.dark"]');
  });

  it('should generate CSS code with custom cssVarPrefix', async () => {
    const themes: Theme[] = [
      {
        name: 'light',
        isDark: false,
        themeOverride: { common: { primaryColor: '#ff0000', successColor: 'hsl(100,100%,50%,0.5)' } },
      },
    ];
    const uno = createGenerator({
      presets: [presetUno(), presetNaiveThemes({ themes, cssVarPrefix: 'my-prefix' })],
    });
    const { css } = await uno.generate(['bg-red-500', `light:color-[hsl(100,100%,50%,0.5)]`]);
    expect(css).toContain('--my-prefix-primary-color: #ff0000;');
    expect(css).toContain('--my-prefix-primary-color-rgb: 255, 0, 0;');
    expect(css).toContain('--my-prefix-primary-color-rgb: 255, 0, 0;');
    expect(css).toContain('--my-prefix-success-color-hsl-alpha: 0.5;');
  });

  it('should generate CSS code with custom layerName', async () => {
    const themes = [
      { name: 'default.light', isDark: false, themeOverride: {} },
      { name: 'default.dark', isDark: true, themeOverride: {} },
    ];
    const uno = createGenerator({
      presets: [presetUno(), presetNaiveThemes({ themes, layerName: 'my-layer', layerOrder: 100 })],
    });
    const { css } = await uno.generate(['bg-red-500']);
    expect(css).toContain('/* layer: my-layer */');
    expect(css.split('\n').filter((i) => i.startsWith('/* layer:'))).toHaveLength(3);
    expect(
      css
        .split('\n')
        .filter((i) => i.startsWith('/* layer:'))
        .at(-1),
    ).toBe('/* layer: my-layer */');
  });
});
