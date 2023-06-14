import { type MaybeRef, ref, shallowRef, toValue, unref } from 'vue';
import { uniqueId } from 'lodash-es';
import { defaultDocument, tryOnMounted, useScriptTag } from '@vueuse/core';

interface UseBMapGLScriptOptions {
  /**
   * @enum {(""|"http"|"https")}
   *
   * @default ""
   * */
  protocol?: MaybeRef<string>;

  /** @default "" */
  ak?: MaybeRef<string>;

  /**
   * @description - 是否自动挂载
   *
   * @default false
   * */
  manual?: boolean;

  document?: Document;
}

const isMapLoaded = () => 'BMapGL' in window && 'Map' in (window as any).BMapGL;
const createRandomId = () => uniqueId('useBMapGLScript');

/**
 * @description - 加载 [🗺️ 百度地图JavaScript API GL ](https://lbsyun.baidu.com/index.php?title=jspopularGL)
 */
export function useBMapGLScript(options?: UseBMapGLScriptOptions) {
  const loaded = ref(toValue(isMapLoaded));
  const error = shallowRef<Error | null>(null);
  const loading = ref(!!0);

  if (toValue(isMapLoaded)) {
    return {
      loaded,
      loading,
      error,
      setup,
    };
  }

  const { protocol = ref(``), ak = ref(BMAP_AK || ''), document = defaultDocument || window.document } = options || {};

  const callbackName = createRandomId();
  (window as any)[callbackName] = onLoaded;

  const getProtocol = () =>
    ({
      '""': '',
      '"undefined"': '',
      '"http"': 'http:',
      '"https"': 'https:',
    }[JSON.stringify(String(unref(protocol)))]);

  const indexUrl = () =>
    `${toValue(getProtocol)}//api.map.baidu.com/api?v=1.0&type=webgl&ak=${unref(ak)}&callback=${callbackName}`;

  const sdkUrl = () => `${toValue(getProtocol)}//api.map.baidu.com/getscript?type=webgl&v=1.0&ak=${unref(ak)}`;

  const { load: loadIndexScript } = useScriptTag(
    indexUrl,

    () => {
      onLoaded();
    },

    {
      defer: !!1,
      immediate: !!0,
      manual: !!1, // 组件卸载无需移除
      document,
    },
  );

  const { load: loadSDKScript } = useScriptTag(
    sdkUrl,

    () => {
      onLoaded();
    },

    {
      defer: !!1,
      immediate: !!0,
      manual: !!1, // 组件卸载无需移除
      document,
    },
  );

  if (!options?.manual) {
    tryOnMounted(setup);
  }

  function onLoaded() {
    if (!isMapLoaded()) {
      loaded.value = !!0;
      loading.value = !!0;
      error.value = new Error('未知网络错误');

      return;
    }

    if ((window as any)[callbackName]) {
      delete (window as any)[callbackName];
    }

    loaded.value = !!1;
    loading.value = !!0;
    error.value = null;
  }

  function loadLinkTag() {
    let link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', 'https://api.map.baidu.com/res/webgl/10/bmap.css');
    document.head.appendChild(link);
  }

  async function fallbackLoadScript() {
    loading.value = !!1;

    // 设置默认参数
    (window as any).BMAP_PROTOCOL = toValue(protocol);
    (window as any).BMapGL_loadScriptTime = new Date().getTime();
    (window as any).BMapGL = (window as any).BMapGL || {};
    (window as any).BMapGL.apiLoad = function () {
      delete (window as any).BMapGL.apiLoad;
      onLoaded();
    };

    // 加载地图样式
    loadLinkTag();

    try {
      // fallback
      await loadSDKScript(!!0);
    } catch (err) {
      error.value = err as any;
      loading.value = !!0;
      loaded.value = !!0;
    }
  }

  async function setup() {
    loading.value = !!1;
    try {
      await loadIndexScript(!!1);
    } catch (err) {
      error.value = err as any;
      await fallbackLoadScript();
    }
  }

  return { loaded, loading, error, setup };
}
