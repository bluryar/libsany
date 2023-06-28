import path from 'path';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import fg from 'fast-glob';

// import eval from 'eval';
import type { Theme } from './types';

const FILE_REGEX = /(\w+)?\.?(light|dark)\.(json|js|ts|mjs|cjs|mts|cts)$/;
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

  /**
   * 是否对引入的模块进行解析, 当你仅需要扫描主题文件夹时获取文件路径时，可以关闭
   *
   * @default true
   */
  parse?: boolean;
}

// /**
//  * 扫描主题文件夹，生成主题列表
//  *
//  * - 基于 esbuild
//  *
//  * @param options 配置
//  *
//  * @deprecated
//  */
// /*#__PURE__*/ export async function fileReader(options?: FileReaderOptions) {
//   const {
//     patterns = ['*.(light|dark).(json|js|ts)', '(light|dark).(json|js|ts)'],
//     dir = './src/themes',
//     parse = true,
//   } = options ?? {};

//   const resolvedDir = path.resolve(process.cwd(), dir);

//   // make sure dir exists
//   try {
//     await readdir(resolvedDir);
//   } catch (error) {
//     await mkdir(resolvedDir);
//   }

//   // read files
//   let files: string[];
//   try {
//     files = await fg(patterns, { cwd: resolvedDir, absolute: !!1 });
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }

//   if (!files?.length) {
//     try {
//       await writeFile(path.join(resolvedDir, 'light.json'), '{}');
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   }

//   // rescan files
//   files = await fg(patterns, { cwd: resolvedDir, absolute: !!1 });
//   files = files.sort((a, b) => a.localeCompare(b));

//   // collect themes
//   const themes: Theme[] = [];

//   if (!parse) {
//     return {
//       themes,
//       files,
//     };
//   }

//   await Promise.all(
//     files.map(async (file) => {
//       let [, themeName = '', dark = ''] = path.basename(file).match(FILE_REGEX) || [];
//       if (dark === '') {
//         return;
//       }
//       themeName = themeName === '' ? dark : `${themeName}.${dark}`;
//       const isDark = dark === 'dark';
//       try {
//         const _file = path.resolve(resolvedDir, file);

//         const modules = await build({
//           write: !!0,
//           format: 'cjs',

//           bundle: !!1,
//           entryPoints: [_file],
//           loader: {
//             '.json': 'json',
//             '.ts': 'ts',
//             '.js': 'js',
//             '.mjs': 'js',
//             '.cjs': 'js',
//             '.mts': 'ts',
//             '.cts': 'ts',
//           },
//         });

//         const rawCode = modules.outputFiles[0].text;
//         const script = new vm.Script(rawCode);
//         const module = createCommonJS(pathToFileURL(_file).toString());
//         const context = { module } as any;
//         script.runInNewContext(context);

//         const exportName = `${themeName}.default`.replaceAll('.', '_');
//         if (exportName in context) {
//           themes.push({
//             name: themeName,
//             isDark,
//             themeOverrides: context[exportName],
//           });
//         } else {
//           throw new Error('default not found');
//         }
//       } catch (error) {
//         console.error(error);
//         throw error;
//       }
//     }),
//   );
//   return {
//     themes,
//     files,
//   };
// }

/**
 * 扫描指定目录指定文件名glob模式的文件，返回文件路径列表
 *
 * - **同步版本, 不安全版本**
 *
 * - 因为我们将通过eval来解析文件, 它依赖于Nodejs的vm模块
 *
 * - 基于 esbuild
 *
 * @see fileReader
 */
export function unsafeFileReaderSync(options?: FileReaderOptions) {
  const { patterns = ['*.(light|dark).json', '(light|dark).json'], dir = './src/themes', parse = true } = options ?? {};

  const resolvedDir = path.resolve(process.cwd(), dir);

  // make sure dir exists
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
      const _file = path.resolve(resolvedDir, file);

      // const modules = buildSync({
      //   write: !!0,
      //   format: 'cjs',

      //   bundle: !!1,
      //   entryPoints: [_file],
      //   loader: {
      //     '.json': 'json',
      //     '.ts': 'ts',
      //     '.js': 'js',
      //     '.mjs': 'js',
      //     '.cjs': 'js',
      //     '.mts': 'ts',
      //     '.cts': 'ts',
      //   },
      // });

      // const rawCode = modules.outputFiles[0].text;
      // const script = new vm.Script(rawCode);
      // const module = createCommonJS(pathToFileURL(_file).toString());
      // const context = { module } as any;
      // script.runInNewContext(context);

      // const exportName = `${themeName}.default`.replaceAll('.', '_');
      const themeOverrides = JSON.parse(readFileSync(_file, 'utf-8')) as any;
      themes.push({
        name: themeName,
        isDark,
        themeOverrides: themeOverrides,
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
