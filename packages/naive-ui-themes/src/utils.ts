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
  const _selector = selector || '';
  const classNames = ['', ...theme.split('.')].join('.');
  let mergedSelector = attribute === 'class' ? `${_selector}${classNames}` : `${_selector}[${attribute}="${theme}"]`;
  if (mergedSelector.startsWith(' ')) {
    mergedSelector = mergedSelector.slice(1);
  }
  return { theme, mergedSelector };
}
