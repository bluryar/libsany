---
category: Component
---

# createHOC

创建一个高阶组件，用于包装一个组件，调整其接收参数的方式。这不是一个通用的方法，它有特定的使用场景。

## Usage

```vue
<script setup lang="tsx">
import { defineComponent } from 'vue'
import { string } from 'vue-types'
import { createHOC } from '@bluryar/composables'

const Demo = defineComponent({
  props: {
    foo: string().def('init'),
    bar: string().def('init'),
  },
  setup(props) {
    return () => <div>foo: { props.foo } & bar: { props.bar }</div>
  },
})

const DemoHOC = createHOC({
  component: Demo,
  state() {
    return {
      foo: 'ok',
    }
  },
})

// ... 某些情况下，我们需要在外部修改组件的 props

const doSomething = (fn: Function) => {
  setTimeout(() => {
    fn()
  }, 1000)
}
doSomething(() => {
  DemoHOC.invoke(() => ({
    foo: 'ok x 2',
  }))
})
</script>

<template>
  <div>
    <!-- #1 foo: ok & bar: bar-->
    <!-- #2 foo: ok x 2 & bar: bar -->
    <DemoHOC.Wrapper bar="bar"></DemoHOC.Wrapper>
  </div>
</template>
```

### 说明

- 优先级：component props > invoke > state
- 参数合并基于 [mergeprops](https://cn.vuejs.org/api/render-function.html#mergeprops) 实现， 该函数的表现类似于 `Object.assign`， 也即优先级高的参数会覆盖优先级低的参数， 为了调整这一行为， 你可以使用 `stateMerge` 配置项调整。
- 不建议统一参数在多个位置传入。
