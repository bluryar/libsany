declare module 'virtual:naive-ui-theme' {
  import type { GlobalThemeOverrides } from 'naive-ui';
  export type ThemeType = default;
  export interface Theme {
    name: ThemeType;
    isDark: boolean;
    themeOverrides: GlobalThemeOverrides;
  }
  declare const themes: Array<Theme>;
  export { themes };
}

declare module '~naive-ui-theme' {
  import type { GlobalThemeOverrides } from 'naive-ui';
  export type ThemeType = default;
  export interface Theme {
    name: ThemeType;
    isDark: boolean;
    themeOverrides: GlobalThemeOverrides;
  }
  declare const themes: Array<Theme>;
  export { themes };
}