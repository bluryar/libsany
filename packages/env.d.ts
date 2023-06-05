/// <reference types="vite/client" />

/** 是否处于开发时 */
declare const __DEV__:boolean;

declare module '*.vue' {
  import type { ComponentOptions } from 'vue'
  const componentOptions: ComponentOptions
  export default componentOptions
}

