import type { GlobalThemeOverrides } from 'naive-ui';
import type { DeepPartial } from 'unocss';
import type UnoThemeDefault from '../uno-theme.json';
import type * as breakpoints from './breakpoints';

export interface Theme {
  name: string;
  isDark: boolean;
  themeOverride: GlobalThemeOverrides;
}

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Breakpoints = Prettify<typeof breakpoints>;
export type UnoTheme = { [x: string]: any } & DeepPartial<typeof UnoThemeDefault>;

type NormalizeBreakpoints<T> = T extends `breakpoints${infer R}` ? R : T;
export type BreakpointsType = NormalizeBreakpoints<keyof Breakpoints>;
