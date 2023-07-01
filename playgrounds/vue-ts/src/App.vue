<script setup lang="tsx">
import { themes, useTheme } from '~naive-ui-theme';

(window as any).themes = themes;

const { setTheme, currentTheme, currentThemeOverrides } = useTheme();
setTheme('default.dark');
</script>

<template>
  <NConfigProvider :theme="currentTheme" :theme-overrides="currentThemeOverrides">
    <RouterView></RouterView>
  </NConfigProvider>
</template>

<style scoped>
.map {
  width: 50vw;
  height: 50vh;
}
</style>
