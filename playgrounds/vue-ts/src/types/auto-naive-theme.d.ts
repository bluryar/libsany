declare module 'virtual:naive-ui-theme' {
  import type { GlobalTheme, GlobalThemeOverrides } from 'naive-ui';
  import type { UseColorModeReturn } from '@vueuse/core';
  import type { ComputedRef } from 'vue';

  export type ThemeType = 'dark' | 'light' | 'default.dark';

  export interface Theme {
    name: ThemeType;
    isDark: boolean;
    themeOverrides: GlobalThemeOverrides;
  }

  export interface UseThemeReturns {
    colorMode: UseColorModeReturn<ThemeType>;
    setTheme: (theme: ThemeType) => void;
    isDark: ComputedRef<boolean>;
    currentTheme: ComputedRef<GlobalTheme>;
    currentThemeOverrides: ComputedRef<GlobalThemeOverrides>;
  }

  declare const themes: Array<Theme>;
  declare const useTheme: (theme: ThemeType) => UseThemeReturns;

  export { themes, useTheme };
}

declare module '~naive-ui-theme' {
  import type { GlobalTheme, GlobalThemeOverrides } from 'naive-ui';
  import type { UseColorModeReturn } from '@vueuse/core';
  import type { ComputedRef } from 'vue';

  export type ThemeType = 'dark' | 'light' | 'default.dark';

  export interface Theme {
    name: ThemeType;
    isDark: boolean;
    themeOverrides: GlobalThemeOverrides;
  }

  export interface UseThemeReturns {
    colorMode: UseColorModeReturn<ThemeType>;
    setTheme: (theme: ThemeType) => void;
    isDark: ComputedRef<boolean>;
    currentTheme: ComputedRef<GlobalTheme>;
    currentThemeOverrides: ComputedRef<GlobalThemeOverrides>;
  }

  declare const themes: Array<Theme>;
  declare const useTheme: (theme: ThemeType) => UseThemeReturns;

  export { themes, useTheme };
}