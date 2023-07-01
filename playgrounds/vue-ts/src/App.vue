<script setup lang="tsx">
import { themes, useTheme } from '~naive-ui-theme';

const res = useTheme();
res.setTheme('default.dark');
</script>

<template>
  <div class="default.light:text-error bg-primary/100 bg-theme-default-dark-primary/10">
    {{ res.currentThemeOverrides }}
    <br />
    <br />
    <br />
    {{ themes }}
  </div>
</template>

<style scoped>
.map {
  width: 50vw;
  height: 50vh;
}
</style>
