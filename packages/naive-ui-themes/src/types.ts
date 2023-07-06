import type { GlobalThemeOverrides } from 'naive-ui';
import type { Theme as UnoMiniTheme } from '@unocss/preset-mini';
import { BuildOptions } from 'esbuild';
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

export interface ModuleLoaderOptions {
  /**
   * 搜索文件的glob模式, 注意这些是同构文件, 会被Node和客户端共享
   *
   * 因此，当你使用非json格式时，不要引用Node的API，也不要引用浏览器的API
   *
   * @default ['*.(light|dark).(json|js|ts|cjs|mjs)']
   */
  patterns?: string[];

  /**
   * 主题文件夹路径
   *
   * @default './src/themes'
   */
  dir?: string;

  /**
   * 是否对引入的模块进行解析, 当你仅需要扫描主题文件夹时获取文件路径时，可以关闭
   *
   * @default true
   */
  parse?: boolean;

  /**
   * esbuild 配置
   */
  esbuild?: Omit<BuildOptions, 'write' | 'format' | 'platform' | 'bundle' | 'entryPoints' | 'loader'>;
}

export interface PresetNaiveThemesOptions<NaiveTheme extends Theme> extends ModuleLoaderOptions {
  /**
   * 插件生成的代码被放置在样式文件的哪个位置
   *
   * @deafult 'un-naive-ui-multi-themes'
   */
  layerName?: string;

  /**
   * 最终生成CSS代码的位置
   *
   * @default 0
   */
  layerOrder?: number;

  /**
   * 主题配置列表
   *
   * - 推荐使用这个包导出的 `fileReader` 读取文件夹下的所有主题文件
   * - 它的读取逻辑与 `vite-plugin-naive-ui-multi-theme` 一致
   */
  themes?: NaiveTheme[];

  /**
   * 主题 对应的类名\属性 被应用的选择器
   *
   * @default 'html'
   */
  selector?: string;

  /**
   * 主题是使用类名还是属性
   *
   * @default 'class'
   */
  attribute?: string;

  /**
   * css变量前缀
   *
   * @default ''
   */
  cssVarPrefix?: string;

  /**
   * 屏幕尺寸断点
   *
   * @default 'AntDesign'
   */
  breakpoints?: BreakpointsType | Record<string, number>;

  /**
   * 是否向 `uno.css` 中插入根据 `theme` 生成的 css vars 声明, 关闭此项, 如果你更希望自己控制naive的这些css变量
   *
   * @default true
   * */
  preflight?: boolean;

  /**
   * 是否扩展uno主题预设, 默认将根据传入 `theme` 来扩展, 假如 `preflight=false` 则此项配置失效
   *
   * @default true
   */
  extendTheme?: boolean;

  /**
   * 是否自动引入主题配置文件
   *
   * @default false
   */
  autoimportThemes?: boolean;
}

export interface NaiveMultiThemeOptions extends ModuleLoaderOptions {
  /**
   * 主题 对应的类名\属性 被应用的选择器
   *
   * @default 'html'
   */
  selector?: string;

  /**
   * 主题是使用类名还是属性
   *
   * @default 'class'
   */
  attribute?: string;

  /**
   * 生成客户端类型定义文件
   *
   * @default 'auto-naive-theme.d.ts'
   */
  dts?: boolean | string;
}
