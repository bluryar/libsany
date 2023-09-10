<script setup lang="tsx">
import { NButton, NDrawer, NDrawerContent } from 'naive-ui';
import { usePopup } from '@bluryar/composables';
import { type ThemeType, themes, useTheme } from '~naive-ui-theme';

const type: ThemeType = 'default.dark';

const res = useTheme();
res.setTheme(type);

let i = 0;
setInterval(() => {
  const res1 = i++ % 2 ? 'default.light' : 'default.dark';
  res.setTheme(res1 as any);
}, 2000);

const { open: openDialog, getState } = usePopup({
  name: 'NDrawerWrapper',
  component: NDrawer,
  auto: !!1,
  visibleKey: 'show',
  props: {
    width: '50%',
    placement: 'right',
  },
  slots: {
    default: () => [
      <NDrawerContent>
        <NButton type="primary">123</NButton>
      </NDrawerContent>,
    ],
  },
});

setTimeout(() => {
  console.log('🚀 ~ file: index.vue:36 ~ setTimeout ~ getState():', getState());
  openDialog();
}, 500);
</script>

<template>
  <div class="bg-primary default.dark:bg-primary default.dark:bg-primary/50 [default.light]:bg-error">
    {{ res.currentThemeOverrides }}
    <br />
    <br />
    <br />
    {{ themes }}
    <NButton type="primary">{{ res.colorMode }}</NButton>
    {{ res.currentThemeOverrides }}
    <br />
    <br />
    <br />
    {{ res }}
  </div>
</template>
