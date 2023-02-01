<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useComponentWrapper, useDialog } from '@bluryar/composables'
import type { DefineComponent, FunctionalComponent } from 'vue'
import { defineAsyncComponent, h, ref, unref } from 'vue'
import type { VueTypeValidableDef } from 'vue-types'
import HelloWorld from './components/HelloWorld.vue'

const foo = ref(10)
const obj = ref({ test: 1 })
const Comp = defineAsyncComponent(() => import('@/components/AsyncComponent.vue'))
const AsyncCmp: FunctionalComponent<{ foo: number }> = () => h('div', '123')

const { Wrapper: AsyncComponent, setState, getState } = useComponentWrapper({
  component: Comp,
  state: () => ({ foo: unref(foo) }),
})

setState(() => ({}))
</script>

<template>
  <header>
    <AsyncComponent v-model:foo="foo" v-model:obj="obj" @click="() => {}" />

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