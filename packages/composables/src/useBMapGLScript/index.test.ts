import { expect } from 'vitest';
import { sleep } from '@bluryar/shared';
import { useSetup } from '../../../.test';
import { useBMapGLScript } from './index';

// ! 请在 .env 中配置 BMAP_AK
// jsdom 似乎无法真正的加载动态脚本，因此这里的测试只能测试到加载脚本的逻辑，无法测试到真正的加载脚本

describe('useBMapGLScript', () => {
  it('should appendChild to document.head when useBMapGLScript is called', async () => {
    const appendChildListener = vi.spyOn(document.head, 'appendChild');

    expect(appendChildListener).not.toBeCalled();

    const vm = useSetup(() => {
      const { loading, indexUrl, fallbackUrl } = useBMapGLScript({ ak: BMAP_AK });

      return {
        loading,
        indexUrl,
        fallbackUrl,
      };
    });

    expect(appendChildListener).toBeCalled();

    expect(vm.loading).toBe(true);
    expect(vm.indexUrl.startsWith('//api.map.baidu.com')).toBe(true);
    expect(vm.fallbackUrl.startsWith('//api.map.baidu.com')).toBe(true);
    expect(document.querySelector(`script[src="${vm.indexUrl}"]`)).toBeInstanceOf(HTMLScriptElement);
  });

  it('should not appendChild to document.head when manual is true', async () => {
    const addChildListener = vi.spyOn(document.head, 'appendChild');

    expect(addChildListener).not.toBeCalled();

    const vm = useSetup(() => {
      const { setup, indexUrl } = useBMapGLScript({ ak: BMAP_AK, manual: true });

      return {
        indexUrl,
        setup,
      };
    });

    expect(addChildListener).not.toBeCalled();
    vm.setup();
    expect(addChildListener).toBeCalledTimes(1);
    expect(document.querySelector(`script[src="${vm.indexUrl}"]`)).toBeInstanceOf(HTMLScriptElement);
  });

  it('should handle loading timeout', async () => {
    const addChildListener = vi.spyOn(document.head, 'appendChild');

    expect(addChildListener).not.toBeCalled();

    const vm = useSetup(() => {
      const { setup, indexUrl, error, loaded, loading } = useBMapGLScript({ ak: BMAP_AK, timeout: 100, manual: true });

      return {
        indexUrl,
        setup,
        error,
        loaded,
        loading,
      };
    });

    expect(addChildListener).not.toBeCalled();
    vm.setup();
    await sleep(20);
    expect(vm.loaded).toBe(false);
    expect(vm.loading).toBe(true);
    await sleep(100);
    expect(vm.loading).toBe(false);
    expect(vm.loaded).toBe(false);
    expect(vm.error).toBeInstanceOf(Error);
    expect(vm.error?.message).toBe('加载超时');

    expect(addChildListener).toBeCalledTimes(1);
    expect(document.querySelector(`script[src="${vm.indexUrl}"]`)).toBeInstanceOf(HTMLScriptElement);
  });
});
