<script setup lang="tsx">
import { getCurrentInstance } from 'vue';
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

const inst = getCurrentInstance();
console.log('🚀 ~ file: index.vue:18 ~ inst:', inst);

const { openDialog } = usePopup({
  component: NDrawer,
  auto: !!1,
  props: {
    width: '50%',
    placement: 'right',
    show: !!1,
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
  openDialog();
}, 1000);
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
