<script setup lang="tsx">
import { ref } from 'vue';
import { useTheme } from '~naive-ui-theme';

const res = useTheme('light');
console.log('🚀 ~ file: App.vue:6 ~ res:', res);

const dom = ref();
</script>

<template>
  <div>
    <NButton>123</NButton>
  </div>
</template>

<style scoped>
.map {
  width: 50vw;
  height: 50vh;
}
</style>
