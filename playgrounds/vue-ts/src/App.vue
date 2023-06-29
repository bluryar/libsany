<script setup lang="tsx">
import { themes, useTheme } from '~naive-ui-theme';

const res = useTheme('default.light');
res.setTheme('default.light');
</script>

<template>
  <div class="default.light:text-cyan">
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
