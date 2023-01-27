<script setup lang="ts">
import { useVModels } from '@vueuse/core'
import { watchEffect } from 'vue'
import { number, object } from 'vue-types'

const props = defineProps({
  foo: number().def(0),
  obj: object<{ test: number }>().def({ test: 0 }),
})

const { foo, obj } = useVModels(props, undefined, { passive: !!1, deep: !!1 })

const onClick = () => {
  foo.value += 1
  obj.value.test += 1
}
</script>

<template>
  <div class="wrapper-component" @click="onClick">
    <span class="foo">foo: {{ foo }}</span>
    <span class="obj">obj.test: {{ obj.test }}</span>
  </div>
</template>
