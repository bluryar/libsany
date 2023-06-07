<script setup lang="tsx">
import { bool, number, object } from 'vue-types'
import { useVModel, useVModels } from '@vueuse/core'
import { defineComponent } from 'vue'

const props = defineProps({
  visible: bool().def(!!0),
  foo: number().def(0),
  obj: object<{ test: number }>().def({ test: 0 }),
})

const FakeDialog = defineComponent({
  props: {
    visible: bool().def(!!0),
  },
  setup(props, { slots }) {
    const visible = useVModel(props, 'visible', undefined, { passive: !!1 })
    const onClick = () => {
      visible.value = !!0
    }

    return () => <div class="fake-dialog-wrapper">
      {
        visible.value
          ? (
            <div class="fake-dialog-content">
              {slots?.default?.()}
            </div>
          )
          : <div class="fake-dialog-empty"></div>
      }

      <div class="fake-dialog-close-btn" onClick={onClick}>关闭按钮</div>
    </div>
  },
})

const {
  visible,
  foo,
  obj,
} = useVModels(props, undefined, { passive: !!1, deep: !!1 })

function onClick() {
  foo.value += 1
  obj.value.test += 1
}
</script>

<template>
  <FakeDialog v-model:visible="visible">
    <div class="use-dialog" @click="onClick">
      foo: {{ foo }}
      obj.test: {{ obj.test }}
    </div>

    <slot :state="props" />
  </FakeDialog>
</template>
