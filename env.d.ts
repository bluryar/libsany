/// <reference types="vite/client" />
/// <reference path="./auto-imports.d.ts" />

/** 是否处于开发时 */
declare const __DEV__: boolean;

declare module '*.vue' {
  import { DefineComponent } from 'vue-demi';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
