import type { Preset } from '@unocss/core';

/**
 * 工具方法, 尝试删除冲突的variant
 * @param preset 期望被删除冲突variant的预设
 */

export function tryRemoveThemeVariant(preset: Preset) {
  const removeableVariants = ['light', '.light', '@light', 'dark', '.dark', '@dark'];

  const { variants } = preset;
  if (variants) {
    removeableVariants.forEach((variant) => {
      const idx = variants.findIndex(({ name }) => name === variant);
      if (idx !== -1) {
        variants.splice(idx, 1);
      }
    });
  }

  return preset;
}
