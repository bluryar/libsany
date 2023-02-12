<script setup lang="tsx">
import { RouterLink, RouterView } from 'vue-router'
import { useComponentWrapper, useForm } from '@bluryar/composables'
import { defineAsyncComponent, ref, unref, watch } from 'vue'
import { isNumber, isObject, isString } from '@bluryar/shared'
import { NButton, NDatePicker, NFormItem, NInput, NInputNumber } from 'naive-ui'
import * as turf from '@turf/turf'
import HelloWorld from './components/HelloWorld.vue'

const foo = ref(10)
const obj = ref({ test: 1 })
const Comp = defineAsyncComponent(() => import('@/components/AsyncComponent.vue'))

const { Wrapper: AsyncComponent, setState } = useComponentWrapper({
  component: Comp,
  state: () => ({ foo: unref(foo) }),
})

setState(() => ({}))

class Outer {
  foo = 1
  bar = ''
  obj = new Inner()
  plgs = { polygons: turf.randomPolygon(20000, { bbox: [-180, -90, 180, 90] }) }
}

class Inner {
  startTime = Date.now()
  endTime = Date.now()
}

const service = (params?: Partial<Outer>) => Promise.resolve({ success: !!1, data: params })

const {
  formParams,
  formStatus,
  formItemsStatus,
  formRequestReturns,
  submit,
  reset,
} = useForm({
  service,
  defaultParams: new Outer(),
  shallowKeys: ['plgs'],
  rules: ({
    'foo': val => (isNumber(val) && val > 10) || '该项必须传入大于10的数字',
    'obj.startTime': val => (isNumber(val) && val > 10) || '该项必须传入大于10的数字',
  }),
})
const { loading } = formRequestReturns
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125">

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">
          Home
        </RouterLink>
        <RouterLink to="/about">
          About
        </RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />

  <AsyncComponent v-model:foo="foo" v-model:obj="obj" @click="() => {}" />

  <MForm :model="formParams">
    <NFormItem path="foo">
      <NInputNumber v-model:value="formParams.foo" />
    </NFormItem>
    <NFormItem path="obj.startTime">
      <NInputNumber v-model:value="formParams.obj!.startTime" />
    </NFormItem>

    <NFormItem>
      <NButton type="primary" :loading="loading" @click="() => submit()">
        提交
      </NButton>
      <NButton type="primary" @click="() => reset()">
        重置
      </NButton>

      {{ formStatus }}
    </NFormItem>
  </MForm>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
