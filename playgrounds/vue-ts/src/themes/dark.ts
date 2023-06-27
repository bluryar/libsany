import type { GlobalThemeOverrides } from 'naive-ui';
import { base } from './test';

export default {
  common: {
    textColor1: '#fff',
    ...base,
  },
} satisfies GlobalThemeOverrides;
