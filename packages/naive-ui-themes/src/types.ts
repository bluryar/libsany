import type { GlobalThemeOverrides } from 'naive-ui';
import type { Theme as UnoMiniTheme } from '@unocss/preset-mini';
import type * as breakpoints from './breakpoints';

export interface Theme {
  name: string;
  isDark: boolean;
  themeOverrides: GlobalThemeOverrides;
}

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Breakpoints = Prettify<typeof breakpoints>;
type NormalizeBreakpoints<T> = T extends `breakpoints${infer R}` ? R : T;
export type BreakpointsType = NormalizeBreakpoints<keyof Breakpoints>;

export interface UnoTheme extends UnoMiniTheme {
  [x: string]: any;
}
