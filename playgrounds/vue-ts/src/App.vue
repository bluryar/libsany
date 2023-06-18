<script setup lang="tsx">
import { ref } from 'vue';

const dom = ref();
</script>

<template>
  <div>
    <div ref="dom" class="map"></div>
  </div>
</template>

<style scoped>
.map {
  width: 50vw;
  height: 50vh;
}
</style>
