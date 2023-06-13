<script setup lang="tsx">
import { RouterLink, RouterView } from 'vue-router';
import { NButton, NModal } from 'naive-ui';
import { useDialog } from '@bluryar/composables';
import { ref } from 'vue';
import { useBMapGLScript } from '@bluryar/composables/src/useBMapGLScript';
import HelloWorld from './components/HelloWorld.vue';

const val = ref(1);

const { loaded } = useBMapGLScript({
  ak: '1XjLLEhZhQNUzd93EjU5nOGQ',
  manual: !!0,
});

const DialogReturn = useDialog({
  component: NModal,
  props: {
    preset: 'dialog',
    title: '提示',
    content: '这是一个弹窗',
    val: 1,
  },
  slots: {
    default: () => [
      <div>
        <div>val: {val.value}</div>
        <div>DialogReturn.getState(): {JSON.stringify(DialogReturn.getState())}</div>
        <div
          onClick={() => {
            DialogReturn.setState('val', DialogReturn.getState().val + 1);
          }}
        >
          Click Me +1: {DialogReturn.getState().val}
        </div>
      </div>,
    ],
  },
  visibleKey: 'show',
  auto: !!1,
});

setInterval(() => {
  val.value++;
}, 1000);
</script>

<template>
  <header>
    <NButton @click="DialogReturn.openDialog">打开弹窗</NButton>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <Hi></Hi>

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
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
