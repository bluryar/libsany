/// <reference types="vite/client" />
/// <reference path="./auto-imports.d.ts" />

/** 是否处于开发时 */
declare const __DEV__: boolean;

/** 百度地图JS SDK的AK */
declare const BMAP_AK: string;

declare module '*.vue' {
  import { DefineComponent } from 'vue-demi';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
