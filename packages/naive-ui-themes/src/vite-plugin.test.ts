import { resolve } from 'path';
import { readdir, rm, writeFile } from 'fs/promises';
import { readFileSync } from 'fs';
import { createServer } from 'vite';
import type { ModuleNode, Plugin } from 'vite';
import { sleep } from '@bluryar/shared';
import { naiveMultiTheme } from './vite-plugin';

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
    expect(code).to.include('export const themes =');

    const virtualModule = server.moduleGraph.getModuleById(virtualModuleId);
    expect(virtualModule?.transformResult?.code).toMatchInlineSnapshot(`
      "
        import { computed, effectScope, unref } from \\"/node_modules/.pnpm/vue@3.3.4/node_modules/vue/dist/vue.runtime.esm-bundler.js\\";
        import { createSharedComposable, tryOnScopeDispose, useColorMode } from \\"/node_modules/.pnpm/@vueuse+core@10.1.2_@vue+composition-api@1.0.0-rc.1_vue@3.3.4/node_modules/@vueuse/core/index.mjs\\";
        import { darkTheme, lightTheme } from \\"/node_modules/.pnpm/naive-ui@2.34.4_vue@3.3.4/node_modules/naive-ui/es/index.js\\";

        const useSharedColorMode = createSharedComposable(useColorMode);

        export const themes = [{\\"name\\":\\"default.light\\",\\"isDark\\":false,\\"themeOverrides\\":{\\"common\\":{\\"bodyColor\\":\\"#d6eafa\\",\\"primaryColor\\":\\"#2282fc\\",\\"primaryColorHover\\":\\"#499DFD\\",\\"primaryColorPressed\\":\\"#1560D0\\",\\"primaryColorSuppl\\":\\"#499DFD\\",\\"layoutSiderColor\\":\\"#ffffff\\",\\"layoutHeaderColor\\":\\"#2282fc\\",\\"layoutTabColor\\":\\"#ffffff\\",\\"scrollbarTrackColor\\":\\"transparent\\",\\"scrollbarThumbColor\\":\\"#e1e1e1\\",\\"scrollbarWidth\\":\\"8px\\",\\"scrollbarHeight\\":\\"8px\\",\\"scrollbarTrackRadius\\":\\"8px\\",\\"scrollbarThumbRadius\\":\\"8px\\"},\\"Layout\\":{\\"color\\":\\"#2282fc\\",\\"headerColor\\":\\"#2282fc\\",\\"headerBorderColor\\":\\"#499DFD\\"},\\"Card\\":{\\"titleTextColor\\":\\"#fff\\",\\"closeIconColor\\":\\"#fff\\",\\"closeIconColorHover\\":\\"#fff\\",\\"closeIconColorPressed\\":\\"#fff\\",\\"closeColorHover\\":\\"#0000\\",\\"closeColorPressed\\":\\"#0000\\"},\\"DataTable\\":{\\"thColor\\":\\"#dcecfb\\",\\"thTextColor\\":\\"#3e3e3e\\",\\"tdColorStriped\\":\\"#eef4fd\\",\\"tdColor\\":\\"#fcfdfe\\",\\"thFontWeight\\":\\"600\\",\\"tdTextColor\\":\\"#010101\\"},\\"Input\\":{\\"border\\":\\"solid 1px #c2cad8\\"},\\"Form\\":{\\"labelTextColor\\":\\"#2d2d2d\\"},\\"Pagination\\":{\\"inputWidthSmall\\":\\"40px\\"}}}];

        export function useTheme(initialValue = 'light') {
          const modes = unref(themes).map((i) => {
            const val = i.name.replace('.', ' ');
            return [i.name, val];
          });

          const options = {
            selector: 'html',

            attribute: 'class',

            initialValue: initialValue,

            modes: Object.fromEntries(modes),

            disableTransition: !!1,
          };

          const scope = effectScope(!!1);

          const colorMode = scope.run(() => useSharedColorMode(options)) ?? useSharedColorMode(options);

          const setTheme = (theme) => {
            colorMode.value = theme;
          };

          const isDark = computed(() => {
            return !!unref(themes).find((i) => i.name === colorMode.value)?.isDark;
          });
          const currentTheme = computed(() => {
            return unref(isDark) ? darkTheme : lightTheme;
          });
          const currentThemeOverrides = computed(() => {
            const res = unref(themes).find((i) => i.name === colorMode.value)?.themeOverrides;
            return res;
          });

          tryOnScopeDispose(scope.stop);

          return {
            colorMode,
            isDark,
            currentTheme,
            currentThemeOverrides,
            setTheme,
          };
        }
      "
    `);
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
