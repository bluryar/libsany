<script setup lang="tsx">
import { func, number, object } from 'vue-types'
import { useVModel } from '@vueuse/core'

const props = defineProps({
  foo: number().def(0),
  obj: object<{ test: number }>().def({ test: 0 }),
  onClick: func<() => void>(),
})

const foo = useVModel(props, 'foo', undefined, { defaultValue: 0, passive: !!1 })
const obj = useVModel(props, 'obj', undefined, { deep: !!1, passive: !!1 })
const onClick = () => {
  foo.value += 1
  obj.value.test += 1
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
    obj {{ obj }}
  </div>
</template>
