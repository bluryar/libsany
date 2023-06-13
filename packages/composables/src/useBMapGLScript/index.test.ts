import { useBMapGLScript } from './index';

describe('useBMapGLScript', () => {
  it('should load the BMapGL script', async () => {
    const appendChildListener = vi.spyOn(document.head, 'appendChild');

    expect(appendChildListener).not.toBeCalled();

    const { loaded, loading, error, setup } = useBMapGLScript({ manual: true, protocol: 'http', document });
    expect(appendChildListener).not.toBeCalled();

    const promise = setup();

    expect(appendChildListener).toBeCalled();

    expect(loading.value).toBe(true);
    expect(loaded.value).toBe(false);
    expect(error.value).toBe(null);

    await promise;

    expect(loading.value).toBe(false);
    expect(loaded.value).toBe(true);
    expect(error.value).toBe(null);
  });
});
