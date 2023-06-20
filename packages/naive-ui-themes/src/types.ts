import type { GlobalThemeOverrides } from 'naive-ui';

export interface Theme {
  name: string;
  isDark: boolean;
  themeOverride: GlobalThemeOverrides;
}
