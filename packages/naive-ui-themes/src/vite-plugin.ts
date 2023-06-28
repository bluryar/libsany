import path from 'path';
import type { ModuleNode, Plugin } from 'vite';
import { normalizePath } from 'vite';
import type { Theme } from './types';
import { type FileReaderOptions, fileReader } from './fileReader';
import { patchWriteFile } from './utils';

const PLUGIN_NAME = 'vite-plugin-naive-ui-multi-theme';

export interface NaiveMultiThemeOptions extends FileReaderOptions {
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

export async function naiveMultiTheme(options?: NaiveMultiThemeOptions): Promise<Plugin> {
  const {
    dts = 'auto-naive-theme.d.ts',
    patterns = ['*.(light|dark).(json|js|ts)', '(light|dark).(json|js|ts)'],
    dir = './src/themes',
    attribute = 'class',
    selector = 'html',
  } = options ?? {};

  const virtualModuleIdList = ['virtual:naive-ui-theme', '~naive-ui-theme'] as const;
  const getResolvedVirtualModuleId = virtualModuleIdList.map((i) => `/0` + i);

  const resolvedDir = path.resolve(process.cwd(), dir);

  const themes = new Map<string, Theme>();

  try {
    await scanThemesDir(dir, patterns, themes);
  } catch (error) {
    console.error(error);
    console.warn(`[vite-plugin-naive-ui-multi-theme] 无法读取主题文件夹: ${resolvedDir}`);
    return { name: PLUGIN_NAME };
  }

  // generate dts
  await genDtsFile(virtualModuleIdList, themes, dts);

  const genCode = async () => {
    await scanThemesDir(dir, patterns, themes);
    await genDtsFile(virtualModuleIdList, themes, dts);
  };

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
        await genCode();
        return genRuntimeCode(themes, attribute, selector);
      }
    },

    async handleHotUpdate(ctx) {
      if (normalizePath(ctx.file).startsWith(normalizePath(resolvedDir))) {
        await genCode();

        const modulesToUpdate = Array.from(ctx.server.moduleGraph.fileToModulesMap.get(ctx.file) || []);

        const virtualModules = getResolvedVirtualModuleId
          .map((id) => ctx.server.moduleGraph.getModuleById(id))
          .filter((i): i is ModuleNode => typeof i !== 'undefined');

        modulesToUpdate.push(...virtualModules);

        return [...new Set(modulesToUpdate)];
      }
    },
  };
}

async function scanThemesDir(dir: string, patterns: string[], themes: Map<string, Theme>) {
  const res = await fileReader({
    dir,
    patterns,
  });
  themes.clear();
  for (const [k, v] of res) {
    themes.set(k, v);
  }
}

async function genDtsFile(
  virtualModuleIdList: readonly ['virtual:naive-ui-theme', '~naive-ui-theme'],
  themes: Map<string, Theme>,
  dts: boolean | string,
) {
  if (dts) {
    const dtsContent = virtualModuleIdList.map(
      (id) => `declare module '${id}' {
  import type { GlobalTheme, GlobalThemeOverrides } from 'naive-ui';
  import type { UseColorModeReturn } from '@vueuse/core';
  import type { ComputedRef } from 'vue';

  export type ThemeType = ${Array.from(themes.keys())
    .map((i) => `'${i}'`)
    .join(' | ')};

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
}`,
    );
    try {
      const dtsPath = path.resolve(process.cwd(), typeof dts === 'string' ? dts : 'auto-naive-theme.d.ts');
      await patchWriteFile(dtsPath, dtsContent.join('\n\n'));
    } catch (error) {
      console.error(error);
      console.warn(`[vite-plugin-naive-ui-multi-theme] 无法写入类型定义文件: ${dts}`);
      return { name: PLUGIN_NAME };
    }
  }
}

async function genRuntimeCode(themes: Map<string, Theme>, attribute = 'class', selector = 'html') {
  const clientCode = `
  import { computed, effectScope, unref } from 'vue';
  import { createSharedComposable, tryOnScopeDispose, useColorMode } from '@vueuse/core';
  import { darkTheme, lightTheme } from 'naive-ui';

  const useSharedColorMode = createSharedComposable(useColorMode);

  export const themes = ${JSON.stringify(Array.from(themes.values()))};

  export function useTheme(initialValue = 'light') {
    const modes = unref(themes).map((i) => {
      const val = ${attribute === 'class' ? `i.name.replace('.', ' ')` : `i.name`};
      return [i.name, val];
    });

    const options = {
      selector: '${selector}',

      attribute: '${attribute}',

      initialValue: initialValue,

      modes: Object.fromEntries(modes),

      disableTransition: !!1,
    };

    const scope = effectScope(!!1);

    const colorMode = scope.run(() => useSharedColorMode(options)) ?? useSharedColorMode(options);

    const setTheme = (theme) => {
      colorMode.value = theme;
    };

    const isDark = computed(() => {
      return !!unref(themes).find((i) => i.name === colorMode.value)?.isDark;
    });
    const currentTheme = computed(() => {
      return unref(isDark) ? darkTheme : lightTheme;
    });
    const currentThemeOverrides = computed(() => {
      const res = unref(themes).find((i) => i.name === colorMode.value)?.themeOverrides;
      return res;
    });

    tryOnScopeDispose(scope.stop);

    return {
      colorMode,
      isDark,
      currentTheme,
      currentThemeOverrides,
      setTheme,
    };
  }
`;

  return clientCode;
}
