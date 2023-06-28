import path from 'path';
import { mkdir, readdir, writeFile } from 'fs/promises';
import { evalModule } from 'mlly';
import fg from 'fast-glob';
import { build } from 'esbuild';
import type { Theme } from './types';

export interface FileReaderOptions {
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
}

/**
 * 扫描主题文件夹，生成主题列表
 *
 * @param options 配置
 */
export async function fileReader(options?: FileReaderOptions) {
  const { patterns = ['*.(light|dark).(json|js|ts)', '(light|dark).(json|js|ts)'], dir = './src/themes' } =
    options ?? {};

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
    files = await fg(patterns, { cwd: resolvedDir, absolute: !!1 });
  } catch (error) {
    console.error(error);
    throw error;
  }

  if (!files?.length) {
    try {
      await writeFile(path.join(resolvedDir, 'light.json'), '{}');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // rescan files
  files = await fg(patterns, { cwd: resolvedDir, absolute: !!1 });

  // collect themes
  const themes = new Map<string, Theme>();
  await Promise.all(
    files.map(async (file) => {
      let [, themeName = '', dark = ''] = path.basename(file).match(/(\w+)?\.?(light|dark)\.(json|js|ts)$/) || [];
      if (dark === '') {
        return;
      }
      if (themeName === '') {
        themeName = dark;
      }
      const isDark = dark === 'dark';
      try {
        const _file = path.resolve(resolvedDir, file);

        const modules = await build({
          write: !!0,
          format: 'esm',
          bundle: !!1,
          entryPoints: [_file],
          loader: {
            '.json': 'json',
            '.ts': 'ts',
            '.js': 'js',
            '.mjs': 'js',
            '.cjs': 'js',
            '.mts': 'ts',
            '.cts': 'ts',
          },
        });

        const themeOverride = await evalModule(modules.outputFiles[0].text);

        if ('default' in themeOverride) {
          themes.set(`${themeName}.${dark}`, {
            name: `${themeName}.${dark}`,
            isDark,
            themeOverrides: themeOverride.default,
          });
        } else {
          throw new Error('default not found');
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    }),
  );
  return themes;
}
