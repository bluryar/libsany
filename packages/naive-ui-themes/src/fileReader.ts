import path from 'path';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import vm from 'vm';
import { pathToFileURL } from 'url';
import fg from 'fast-glob';
import { createCommonJS } from 'mlly';
import { BuildOptions, BuildResult, buildSync } from 'esbuild';
import _ from 'lodash';
import type { FileReaderOptions, Theme } from './types';

const FILE_REGEX = /(\w+)?\.?(light|dark)\.(json|js|ts|mjs|cjs|mts|cts)$/;

/**
 * 扫描主题文件夹，生成主题列表
 *
 * - 基于 esbuild
 *
 * @param options 配置
 *
 * @deprecated
 */
export async function fileReader(options?: FileReaderOptions) {
  const {
    patterns = ['*.(light|dark).(json|js|ts)', '(light|dark).(json|js|ts)'],
    dir = './src/themes',
    parse = true,
    esbuild = {},
  } = options ?? {};

  const resolvedDir = path.resolve(process.cwd(), dir);

  let files: string[] = readFilesAndCreate(resolvedDir, patterns);

  // collect themes
  const themes: Theme[] = [];

  if (!parse) {
    return {
      themes,
      files,
    };
  }

  await Promise.all(
    files.map(async (file) => {
      let [, themeName = '', dark = ''] = path.basename(file).match(FILE_REGEX) || [];
      if (dark === '') {
        return;
      }
      themeName = themeName === '' ? dark : `${themeName}.${dark}`;
      const isDark = dark === 'dark';
      try {
        const modules = buildSync(getBuildOptions(file, esbuild));

        const themeOverrides = parseModule(modules, file, themeName);

        themes.push({
          name: themeName,
          isDark,
          themeOverrides,
        });
      } catch (error) {
        console.error(error);
        throw error;
      }
    }),
  );
  return {
    themes,
    files,
  };
}

/**
 * 扫描指定目录指定文件名glob模式的文件，返回文件路径列表
 *
 * - **同步版本, 不安全版本**
 *
 * - 基于 esbuild 和 node:vm 模块
 *
 * @see fileReader
 */
export function unsafeFileReaderSync(options?: FileReaderOptions) {
  const {
    patterns = ['*.(light|dark).json', '(light|dark).json'],
    dir = './src/themes',
    parse = true,
    esbuild = {},
  } = options ?? {};

  const resolvedDir = path.resolve(process.cwd(), dir);

  // make sure dir exists
  let files: string[] = readFilesAndCreate(resolvedDir, patterns);

  // collect themes
  const themes: Theme[] = [];

  if (!parse) {
    return {
      themes,
      files,
    };
  }

  files.forEach((file) => {
    let [, themeName = '', dark = ''] = path.basename(file).match(FILE_REGEX) || [];
    if (dark === '') {
      return;
    }
    themeName = themeName === '' ? dark : `${themeName}.${dark}`;
    const isDark = dark === 'dark';
    try {
      const modules = buildSync(getBuildOptions(file, esbuild));

      const themeOverrides = parseModule(modules, file, themeName);

      themes.push({
        name: themeName,
        isDark,
        themeOverrides,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

  return {
    themes,
    files,
  };
}

function getBuildOptions(file: string, esbuild: BuildOptions): BuildOptions & { write: false } {
  return {
    write: !!0,
    format: 'cjs',
    platform: 'node',
    bundle: !!1,
    entryPoints: [file],
    loader: {
      '.json': 'json',
      '.ts': 'ts',
      '.js': 'js',
      '.mjs': 'js',
      '.cjs': 'js',
      '.mts': 'ts',
      '.cts': 'ts',
    },
    ..._.omit(esbuild, ['write', 'format', 'platform', 'bundle', 'entryPoints', 'loader'] as const),
  };
}

function parseModule(
  modules: BuildResult<
    BuildOptions & {
      write: false;
    }
  >,
  file: string,
  themeName: string,
) {
  const rawCode = modules.outputFiles[0].text;
  const script = new vm.Script(rawCode);
  const module = createCommonJS(pathToFileURL(file).toString());
  const context = { module } as any;
  script.runInNewContext(context);
  const exportName = `${themeName}.default`.replaceAll('.', '_');
  const themeOverrides = context[exportName];
  return themeOverrides;
}

function readFilesAndCreate(resolvedDir: string, patterns: string[]): string[] | never {
  try {
    readdirSync(resolvedDir);
  } catch (error) {
    mkdirSync(resolvedDir);
  }

  // read files
  let files: string[];
  try {
    files = fg.sync(patterns, { cwd: resolvedDir, absolute: !!1 });
  } catch (error) {
    console.error(error);
    throw error;
  }

  if (!files?.length) {
    try {
      writeFileSync(path.join(resolvedDir, 'light.json'), '{}');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // rescan files
  files = fg.sync(patterns, { cwd: resolvedDir, absolute: !!1 });
  files = files.sort((a, b) => a.localeCompare(b));
  return files;
}
