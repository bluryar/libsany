import { type MaybeRef, computed, ref, shallowRef, toValue, unref } from 'vue';
import { uniqueId } from 'lodash-es';
import { defaultDocument, tryOnMounted, useScriptTag, useTimeout } from '@vueuse/core';

export interface UseBMapGLScriptOptions {
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

  /**
   * @description - 脚本加载超时时间, 单位毫秒
   *
   * @default 3000
   */
  timeout?: number;

  document?: Document;
}

const isMapLoaded = () => 'BMapGL' in window && 'Map' in (window as any).BMapGL;
const createRandomId = () => uniqueId('useBMapGLScript');

/**
 * @description - 动态加载 [🗺️ 百度地图JavaScript API GL ](https://lbsyun.baidu.com/index.php?title=jspopularGL)。
 */
export function useBMapGLScript(options?: UseBMapGLScriptOptions) {
  const {
    protocol = ref(``),
    ak = ref(BMAP_AK || ''),
    document = defaultDocument || window.document,
    manual = !!0,
    timeout = 3000,
  } = options || {};

  const loaded = ref(toValue(isMapLoaded));
  const error = shallowRef<Error | null>(null);
  const loading = ref(!!0);

  const getProtocol = () =>
    ({
      '""': '',
      '"undefined"': '',
      '"http"': 'http:',
      '"https"': 'https:',
    }[JSON.stringify(String(unref(protocol)))]);

  const callbackName = createRandomId();
  const indexUrl = computed(
    () => `${toValue(getProtocol)}//api.map.baidu.com/api?v=1.0&type=webgl&ak=${unref(ak)}&callback=${callbackName}`,
  );

  const fallbackUrl = computed(
    () => `${toValue(getProtocol)}//api.map.baidu.com/getscript?type=webgl&v=1.0&ak=${unref(ak)}`,
  );

  if (toValue(isMapLoaded)) {
    return {
      loaded,
      loading,
      error,
      setup,
      indexUrl,
      fallbackUrl,
    };
  }

  (window as any)[callbackName] = onLoaded;

  const { load: loadIndexScript } = useScriptTag(
    indexUrl,

    () => {},

    {
      async: !!1,
      defer: !!1,
      immediate: !!0,
      manual: !!1, // 组件卸载无需移除
      document,
    },
  );

  const { load: loadSDKScript } = useScriptTag(
    fallbackUrl,

    () => {},

    {
      async: !!1,
      defer: !!1,
      immediate: !!0,
      manual: !!1, // 组件卸载无需移除
      document,
    },
  );

  if (!manual) {
    tryOnMounted(setup);
  }

  const { start: startTimer, stop: stopTimer } = useTimeout(timeout, {
    immediate: !!0,
    controls: !!1,
    callback() {
      if (toValue(isMapLoaded)) {
        return;
      }
      if (toValue(loaded)) {
        return;
      }
      loaded.value = !!0;
      loading.value = !!0;
      error.value = new Error('加载超时');
    },
  });

  function onLoaded() {
    stopTimer();

    if (!toValue(isMapLoaded)) {
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

  async function fallbackLoadScript(waitForScriptLoaded = !!1) {
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
      await loadSDKScript(waitForScriptLoaded);
    } catch (err) {
      stopTimer();
      error.value = new Error('加载失败');
      Object.assign(error.value, { cause: err });
      loading.value = !!0;
      loaded.value = !!0;
    }
  }

  /**
   * 加载脚本，当尝试加载完整脚本失败就会进入 fallback 处理， 将脚本内容硬编码
   * @param waitForScriptLoaded - 是否等待脚本加载完成
   */
  async function setup(waitForScriptLoaded = !!1) {
    loading.value = !!1;
    startTimer();
    try {
      await loadIndexScript(waitForScriptLoaded);
    } catch (err) {
      await fallbackLoadScript(waitForScriptLoaded);
    } finally {
      stopTimer();
    }
  }

  return { loaded, loading, error, setup, indexUrl, fallbackUrl };
}
