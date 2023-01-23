<script setup lang="ts">
import { func, number } from 'vue-types'
import { useVModel } from '@vueuse/core'

const props = defineProps({
  foo: number().def(0),
  onClick: func<() => void>(),
})

const foo = useVModel(props, 'foo', undefined, { defaultValue: 0, passive: !!1 })
const onClick = () => {
  foo.value += 1
}
</script>

<template>
  <div
    class="test-dom" @click="() => {
      onClick()
      props.onClick?.()
    }"
  >
    test {{ foo }}
  </div>
</template>
