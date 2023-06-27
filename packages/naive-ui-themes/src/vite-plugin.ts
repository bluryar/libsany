import path from 'path';
import { mkdir, readdir, writeFile } from 'fs/promises';
import type { Plugin } from 'vite';
import fg from 'fast-glob';
import type { Theme } from './types';

// import {createCommonJS} from 'mlly'

const PLUGIN_NAME = 'vite-plugin-naive-ui-multi-theme';

export interface NaiveMultiThemeOptions {
  /**
   * 生成客户端类型定义文件
   *
   * @default 'auto-naive-theme.d.ts'
   */
  dts?: boolean | string;

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
  dir: string;
}

// const {} = createCommonJS(import.meta.url)

export async function naiveMultiTheme(options?: NaiveMultiThemeOptions): Promise<Plugin> {
  const {
    dts = 'auto-naive-theme.d.ts',
    patterns = ['*.(light|dark).(json|js|ts|cjs|mjs)', '(light|dark).json'],
    dir = './src/themes',
  } = options ?? {};

  const virtualModuleIdList = ['virtual:naive-ui-theme', '~naive-ui-theme'] as const;
  const getResolvedVirtualModuleId = virtualModuleIdList.map((i) => `/0` + i);

  const resolvedDir = path.resolve(process.cwd(), dir);

  // make sure dir exists
  try {
    await readdir(resolvedDir);
  } catch (error) {
    await mkdir(resolvedDir);
  }

  // read files
  let files: string[];
  try {
    files = await fg(patterns, { cwd: resolvedDir });
  } catch (error) {
    console.error(error);
    return { name: PLUGIN_NAME };
  }

  if (!files?.length) {
    try {
      await writeFile(path.join(resolvedDir, 'light.json'), '{}');
    } catch (error) {
      console.error(error);
      return { name: PLUGIN_NAME };
    }
  }

  // collect themes
  const themes = new Map<string, Theme>();
  for (const file of files) {
    let [, themeName = '', dark = ''] = path.basename(file).match(/(\w+)\.?(light|dark)\.(json|js|ts|cjs|mjs)$/) || [];
    if (dark === '') {
      console.warn(`[vite-plugin-naive-ui-multi-theme] invalid theme file name: ${file}`);
      continue;
    }
    if (themeName === '') {
      themeName = dark;
    }
    const isDark = dark === 'dark';
    try {
      const themeOverride = await import(path.resolve(resolvedDir, file));
      if ('default' in themeOverride) {
        themes.set(themeName, { name: themeName, isDark, themeOverride: themeOverride.default });
      } else {
        throw new Error('default not found');
      }
    } catch (error) {
      console.error(error);
      console.warn(`[vite-plugin-naive-ui-multi-theme] invalid theme file: ${file}`);
      return { name: PLUGIN_NAME };
    }
  }

  // generate dts
  if (dts) {
    const dtsPath = path.resolve(process.cwd(), typeof dts === 'string' ? dts : 'auto-naive-theme.d.ts');
    const dtsContent = virtualModuleIdList.map(
      (id) => `declare module '${id}' {
  import type { Theme as TTheme } from '@bluryar/naive-ui-themes';
  export type ThemeType = ${Array.from(themes.keys()).join(' | ')};
  export interface Theme extends TTheme {
    name: ThemeType;
  }
  declare const themes: Array<Theme>;
  export { themes };
}`,
    );
    try {
      await writeFile(dtsPath, dtsContent.join('\n\n'));
    } catch (error) {
      console.error(error);
      return { name: PLUGIN_NAME };
    }
  }

  return {
    name: PLUGIN_NAME,

    /**
     * 解析虚拟模块 id。
     * @param id 模块 id。
     * @returns 解析后的模块 id。
     */
    resolveId(id) {
      const idx = virtualModuleIdList.indexOf(id as any);
      if (idx !== -1) {
        return getResolvedVirtualModuleId[idx];
      }
    },

    /**
     * 加载虚拟模块。
     * @param id 模块 id。
     * @returns 模块代码。
     */
    async load(id) {
      const idx = getResolvedVirtualModuleId.indexOf(id);
      if (idx !== -1) {
        return '';
      }
    },
  };
}
