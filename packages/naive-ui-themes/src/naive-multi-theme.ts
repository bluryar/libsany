import path from 'node:path';
import type { ModuleNode, Plugin } from 'vite';
import { normalizePath } from 'vite';
import type { ModuleLoaderOptions, NaiveMultiThemeOptions, Theme } from './types';
import { moduleLoader } from './module-loader';
import { patchWriteFile } from './utils';

const PLUGIN_NAME = 'vite-plugin-naive-ui-multi-theme';

export async function naiveMultiTheme(options?: NaiveMultiThemeOptions): Promise<Plugin> {
  const {
    dts = 'auto-naive-theme.d.ts',
    patterns = ['*.(light|dark).json', '(light|dark).json'],
    dir = './src/themes',
    attribute = 'class',
    selector = 'html',
    esbuild = {},
  } = options ?? {};

  const virtualModuleIdList = ['virtual:naive-ui-theme', '~naive-ui-theme'] as const;
  const getResolvedVirtualModuleId = virtualModuleIdList.map((i) => `/0` + i);

  const resolvedDir = path.resolve(process.cwd(), dir);

  let themes: Theme[] = [];

  try {
    await scanThemesDir({ dir, patterns, esbuild }, themes);
  } catch (error) {
    console.error(error);
    console.warn(`[${PLUGIN_NAME}] 无法读取主题文件夹: ${resolvedDir}`);
    return { name: PLUGIN_NAME };
  }

  // generate dts
  await genDtsFile(virtualModuleIdList, themes, dts);

  const genCode = async () => {
    await scanThemesDir({ dir, patterns, esbuild }, themes);
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

async function scanThemesDir(fileReaderOptions: ModuleLoaderOptions, themes: Theme[]) {
  const { dir, esbuild, patterns } = fileReaderOptions;
  const { themes: _themes } = await moduleLoader({
    dir,
    esbuild,
    patterns,
  });
  themes.length = 0;
  Object.assign(themes, _themes);
}

async function genDtsFile(
  virtualModuleIdList: readonly ['virtual:naive-ui-theme', '~naive-ui-theme'],
  themes: Theme[],
  dts: boolean | string,
) {
  if (dts) {
    const dtsContent = virtualModuleIdList.map(
      (id) => `declare module '${id}' {
  import type { GlobalTheme, GlobalThemeOverrides } from 'naive-ui';
  import type { UseColorModeOptions, UseColorModeReturn } from '@vueuse/core';
  import type { ComputedRef, ShallowRef } from 'vue';

  export type ThemeType = ${Array.from(themes)
    .map((i) => `'${i.name}'`)
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

  const themes: ShallowRef<Array<Theme>>;
  const useTheme: (theme?: ThemeType, options?: UseColorModeOptions<ThemeType>) => UseThemeReturns;

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

async function genRuntimeCode(themes: Theme[], attribute = 'class', selector = 'html') {
  const clientCode = `import { computed, effectScope, shallowRef, unref, triggerRef } from 'vue';
import { tryOnScopeDispose, useColorMode } from '@vueuse/core';
import { darkTheme, lightTheme } from 'naive-ui';

const getHash = () => Math.random().toString(36).substring(2, 8)


export let themes = shallowRef(${JSON.stringify(Array.from(themes))});

if (import.meta.env.DEV) themes.__hash = getHash();

export let useTheme = (initialValue = 'auto', options = {}) => {
  let scope = effectScope(!!1);

  let colorMode = scope.run(() => {
    const optionsComputed = computed(() => {
      const modes = unref(themes).map((i) => {
        const val = ${attribute === 'class' ? `i.name.replace('.', ' ')` : `i.name`};
        return [i.name, val];
      });

      const _options = {
        selector: '${selector}',
        attribute: '${attribute}',
        initialValue: initialValue,
        modes: Object.fromEntries(modes),
        disableTransition: !!1,
        storageKey: '${PLUGIN_NAME}',
        ...options,
      };

      return _options
    })

    return useColorMode(unref(optionsComputed))
  });

  const setTheme = (theme) => {
    colorMode.value = theme;
  };

  const isDark = computed(() => {
    return !!unref(themes)?.find((i) => i.name === colorMode.value)?.isDark;
  });

  const currentTheme = computed(() => {
    return unref(isDark) ? darkTheme : lightTheme;
  });

  const currentThemeOverrides = computed(() => {
    const res = unref(themes)?.find((i) => i.name === colorMode.value)?.themeOverrides || {};
    return res;
  });

  const dispose = () => {
    scope.stop()
    scope = undefined
    colorMode = undefined
  }

  tryOnScopeDispose(dispose);

  return {
    colorMode,
    isDark,
    currentTheme,
    currentThemeOverrides,
    setTheme,
  };
}

if (import.meta.env.DEV) useTheme.__hash = getHash();

if (import.meta.hot) {
  import.meta.hot.accept(
    (newModule) => {
      if(!import.meta.hot.data.rawThemes) {
        import.meta.hot.data.rawThemes = themes;
      }

      import.meta.hot.data.prevThemes = themes;

      import.meta.hot.data.currThemes = newModule.themes;

      import.meta.hot.data.rawThemes.value = newModule.themes.value;

      themes.value = newModule.themes.value;
    }
  )
}

`;

  return clientCode;
}
