/// <reference types="vite/client" />

/** 是否处于开发时 */
declare const __DEV__:boolean;

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
