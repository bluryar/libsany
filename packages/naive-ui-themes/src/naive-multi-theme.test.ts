import { resolve } from 'path';
import { readdir, rm, writeFile } from 'fs/promises';
import { readFileSync } from 'fs';
import { createServer } from 'vite';
import type { ModuleNode, Plugin } from 'vite';
import { sleep } from '@bluryar/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { naiveMultiTheme } from './naive-multi-theme';

const NOT_EXIST_DIR = './do-not-exits-themes';
const options = {
  dir: './packages/naive-ui-themes/test/fixtures/themes',
  dts: './packages/naive-ui-themes/test/fixtures/themes.d.ts',
};
const name = 'vite-plugin-naive-ui-multi-theme';

describe('naiveMultiTheme', () => {
  beforeAll(clear);
  afterAll(clear);

  it('should return a Vite plugin', async () => {
    const plugin = await naiveMultiTheme(options);
    expect(plugin.name).to.equal('vite-plugin-naive-ui-multi-theme');
    expect(typeof plugin.resolveId).to.equal('function');
    expect(typeof plugin.load).to.equal('function');
    expect(typeof plugin.handleHotUpdate).to.equal('function');
  });

  it('should handle virtual module', async () => {
    const server = await createServer({
      plugins: [naiveMultiTheme(options)],
    });
    const plugin = server.config.plugins.find((p) => p.name === name) as Plugin;

    // make virtual module valid
    await server.transformRequest('virtual:naive-ui-theme');

    const virtualModuleId = '/0virtual:naive-ui-theme';
    const resolveId = await (plugin.resolveId as any)('virtual:naive-ui-theme');
    expect(resolveId).to.equal(virtualModuleId);

    const code = await (plugin.load as any)(virtualModuleId);
    expect(code).to.include('export let themes =');

    const virtualModule = server.moduleGraph.getModuleById(virtualModuleId);
    expect(virtualModule?.transformResult?.code).to.include('export let themes =');
  });

  // FIXME 无法测试HMR的情况
  it('should handle hot update', async () => {
    const server = await createServer({
      plugins: [
        naiveMultiTheme({
          ...options,
          dir: NOT_EXIST_DIR,
        }),
      ],
    });
    server.listen();
    const plugin = server.config.plugins.find((p) => p.name === name) as Plugin;

    // make virtual module valid
    await server.transformRequest('~naive-ui-theme');

    const virtualModuleId = '/0~naive-ui-theme';

    const filePath = resolve(process.cwd(), NOT_EXIST_DIR, 'light.json');

    if (plugin.handleHotUpdate) {
      const needToUpdateModule = (await (plugin.handleHotUpdate as any)({
        file: filePath,
        server,
        timstamp: Date.now(),
        modules: [],
        read: () => readFileSync(filePath, 'utf-8'),
      })) as ModuleNode[];

      await writeFile(filePath, JSON.stringify({ test: 'test' }), 'utf-8');
      await sleep(10);

      expect(needToUpdateModule?.length).to.equal(1);
      expect(needToUpdateModule?.[0].id).to.equal(virtualModuleId);
    }

    server.close();
    clear();
  });
});

async function clear() {
  try {
    await readdir(resolve(NOT_EXIST_DIR));
    await rm(resolve(NOT_EXIST_DIR), { recursive: true, force: !!1 });
  } catch (error) {}
}
