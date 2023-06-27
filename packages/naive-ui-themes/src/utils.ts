import type { WriteFileOptions } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { kebabCase } from 'lodash-es';
import type { Theme } from './types';

/** rgb => rgba */
export function withAlphaColorType(type: string) {
  return type.endsWith('a') ? type : type + 'a';
}
/** rgba => rgb */
export function withoutAlphaColorType(type: string) {
  return type.replace(/a$/, '');
}
export function wrapCssVarKey(cssVarPrefix: string, name: string, suffix?: string) {
  return `--${kebabCase(cssVarPrefix + '-' + name + '-' + (suffix ?? ''))}`;
}
export function getSelector<NaiveTheme extends Theme>(themeObj: NaiveTheme, selector: string, attribute: string) {
  const theme = themeObj.name;
  return getSelectorByName(theme, selector, attribute);
}

export function getSelectorByName(name: string, selector: string, attribute: string) {
  const theme = name;
  const _selector = selector || '';
  const classNames = ['', ...theme.split('.')].join('.');
  let mergedSelector = attribute === 'class' ? `${_selector}${classNames}` : `${_selector}[${attribute}="${theme}"]`;
  if (mergedSelector.startsWith(' ')) {
    mergedSelector = mergedSelector.slice(1);
  }
  return { theme, mergedSelector };
}

/** 写入文件，在写入文件前进行内容对比 */
export async function patchWriteFile(path: string, content: string, options?: WriteFileOptions): Promise<void> {
  try {
    // Read the existing file content
    const existingContent = await readFile(path, { encoding: 'utf-8' });

    // If the existing content is the same as the new content, do not write to the file
    if (existingContent === content) {
      return Promise.resolve();
    }

    // Otherwise, write the new content to the file
    await writeFile(path, content, options);
  } catch (error) {
    // If there was an error reading the file, or the existing content is not the same as the new content, write the new content to the file
    await writeFile(path, content, options);
  }
}
