<script setup lang="tsx">
import { useTheme } from '~naive-ui-theme';

const res = useTheme('light');
res.setTheme('light');
console.log('🚀 ~ file: App.vue:6 ~ res:', res);
</script>

<template>
  <div>
    {{ res.currentThemeOverrides }}
  </div>
</template>

<style scoped>
.map {
  width: 50vw;
  height: 50vh;
}
</style>
