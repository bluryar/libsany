import { readdir, rm } from 'fs/promises';
import { resolve } from 'path';
import { fileReader } from './fileReader';

const NOT_EXIST_DIR = './do-not-exits-themes';
describe('fileReader', () => {
  beforeAll(clear);
  afterAll(clear);

  it('should create a default light.json', async () => {
    const themes = await fileReader({
      dir: NOT_EXIST_DIR,
    });
    expect(themes).instanceOf(Map);
    expect(themes.size).toBe(1);
    expect(themes).toMatchInlineSnapshot(`
      Map {
        "light" => {
          "isDark": false,
          "name": "light",
          "themeOverride": {},
        },
      }
    `);

    clear();
  });

  it('should read a default.light.json', async () => {
    const themes = await fileReader({
      dir: './packages/naive-ui-themes/test/fixtures/themes',
    });
    expect(themes).instanceOf(Map);
    expect(themes.size).toBe(1);
    expect(themes).toMatchInlineSnapshot(`
      Map {
        "default" => {
          "isDark": false,
          "name": "default",
          "themeOverride": {
            "Card": {
              "closeColorHover": "#0000",
              "closeColorPressed": "#0000",
              "closeIconColor": "#fff",
              "closeIconColorHover": "#fff",
              "closeIconColorPressed": "#fff",
              "titleTextColor": "#fff",
            },
            "DataTable": {
              "tdColor": "#fcfdfe",
              "tdColorStriped": "#eef4fd",
              "tdTextColor": "#010101",
              "thColor": "#dcecfb",
              "thFontWeight": "600",
              "thTextColor": "#3e3e3e",
            },
            "Form": {
              "labelTextColor": "#2d2d2d",
            },
            "Input": {
              "border": "solid 1px #c2cad8",
            },
            "Layout": {
              "color": "#2282fc",
              "headerBorderColor": "#499DFD",
              "headerColor": "#2282fc",
            },
            "Pagination": {
              "inputWidthSmall": "40px",
            },
            "common": {
              "bodyColor": "#d6eafa",
              "layoutHeaderColor": "#2282fc",
              "layoutSiderColor": "#ffffff",
              "layoutTabColor": "#ffffff",
              "primaryColor": "#2282fc",
              "primaryColorHover": "#499DFD",
              "primaryColorPressed": "#1560D0",
              "primaryColorSuppl": "#499DFD",
              "scrollbarHeight": "8px",
              "scrollbarThumbColor": "#e1e1e1",
              "scrollbarThumbRadius": "8px",
              "scrollbarTrackColor": "transparent",
              "scrollbarTrackRadius": "8px",
              "scrollbarWidth": "8px",
            },
          },
        },
      }
    `);
  });
});

async function clear() {
  try {
    await readdir(resolve(NOT_EXIST_DIR));
    await rm(resolve(NOT_EXIST_DIR), { recursive: true, force: !!1 });
  } catch (error) {}
}
