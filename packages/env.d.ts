/// <reference types="vite/client" />

/** 是否处于开发时 */
declare const __DEV__:boolean;

declare global {
  const __DEV__: boolean | undefined
}

declare module '*.vue' {
  import { defineComponent } from 'vue'
  const Component: ReturnType<typeof defineComponent>
  export default Component
}
