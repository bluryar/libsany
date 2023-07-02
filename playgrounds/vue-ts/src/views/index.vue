<script setup lang="tsx">
import { themes, useTheme } from '~naive-ui-theme';

const res = useTheme();
res.setTheme('default.dark');

// let i = 0;
// setInterval(() => {
//   const res1 = i++ % 2 ? 'default.light' : 'default.dark';
//   console.log('🚀 ~ file: index.vue:11 ~ setInterval ~ res:', res1);
//   res.setTheme(res1 as any);
// }, 1000);
</script>

<template>
  <div class="[default.light]:bg-primary bg-op-10">
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
