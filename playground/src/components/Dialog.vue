<script setup lang="ts">
import { bool, number, object } from 'vue-types'
import { NModal } from 'naive-ui'
import { useVModels } from '@vueuse/core'

const props = defineProps({
  visible: bool().def(!!0),
  foo: number().def(0),
  obj: object<{ test: number }>().def({ test: 0 }),
})

const {
  visible,
  foo,
  obj,
} = useVModels(props, undefined, { passive: !!1, deep: !!1 })

const onClick = () => {
  foo.value += 1
  obj.value.test += 1
}
</script>

<template>
  <NModal v-model:show="visible" preset="card">
    <div class="use-dialog" @click="onClick">
      foo: {{ foo }}
      obj.test: {{ obj.test }}
    </div>

    <slot :state="props" />
  </NModal>
</template>
