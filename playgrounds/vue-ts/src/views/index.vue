<script setup lang="tsx">
import { type ThemeType, themes, useTheme } from '~naive-ui-theme';

const type: ThemeType = 'default.dark';

const res = useTheme();
res.setTheme(type);

let i = 0;
setInterval(() => {
  const res1 = i++ % 2 ? 'default.light' : 'default.dark';
  res.setTheme(res1 as any);
}, 5000);
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
