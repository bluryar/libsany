declare module 'virtual:naive-ui-theme' {
  import type { GlobalTheme, GlobalThemeOverrides } from 'naive-ui';
  import type { UseColorModeOptions, UseColorModeReturn } from '@vueuse/core';
  import type { ComputedRef, ShallowRef } from 'vue';

  export type ThemeType = 'light';

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

  const themes: ShallowRef<Array<Theme>>;
  const useTheme: (theme?: ThemeType, options?: UseColorModeOptions<ThemeType>) => UseThemeReturns;

  export { themes, useTheme };
}

declare module '~naive-ui-theme' {
  import type { GlobalTheme, GlobalThemeOverrides } from 'naive-ui';
  import type { UseColorModeOptions, UseColorModeReturn } from '@vueuse/core';
  import type { ComputedRef, ShallowRef } from 'vue';

  export type ThemeType = 'light';

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

  const themes: ShallowRef<Array<Theme>>;
  const useTheme: (theme?: ThemeType, options?: UseColorModeOptions<ThemeType>) => UseThemeReturns;

  export { themes, useTheme };
}