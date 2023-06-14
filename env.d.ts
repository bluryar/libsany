/// <reference types="vite/client" />

/** 是否处于开发时 */
declare const __DEV__: boolean;

/** 百度地图JS SDK的AK */
declare const BMAP_AK: string;

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
