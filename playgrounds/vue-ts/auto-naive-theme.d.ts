declare module 'virtual:naive-ui-theme' {
  import type { GlobalTheme, GlobalThemeOverrides } from 'naive-ui';

  export type ThemeType = light;

  export interface Theme {
    name: ThemeType;
    isDark: boolean;
    themeOverrides: GlobalThemeOverrides;
  }

  export interface UseThemeReturns {
    state: ThemeType;
    setTheme: (theme: ThemeType) => void;
    isDark: boolean;
    currentTheme: GlobalTheme;
    currentThemeOverrides: GlobalThemeOverrides;
  }

  declare const themes: Array<Theme>;
  declare const useTheme: (theme: ThemeType) => UseThemeReturns;

  export { themes, useTheme };
}

declare module '~naive-ui-theme' {
  import type { GlobalTheme, GlobalThemeOverrides } from 'naive-ui';

  export type ThemeType = light;

  export interface Theme {
    name: ThemeType;
    isDark: boolean;
    themeOverrides: GlobalThemeOverrides;
  }

  export interface UseThemeReturns {
    state: ThemeType;
    setTheme: (theme: ThemeType) => void;
    isDark: boolean;
    currentTheme: GlobalTheme;
    currentThemeOverrides: GlobalThemeOverrides;
  }

  declare const themes: Array<Theme>;
  declare const useTheme: (theme: ThemeType) => UseThemeReturns;

  export { themes, useTheme };
}