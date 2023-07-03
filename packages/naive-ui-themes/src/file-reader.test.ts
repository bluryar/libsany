import { readdir, rm } from 'fs/promises';
import { resolve } from 'path';
import { sleep } from '@bluryar/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { fileReader, unsafeFileReaderSync } from './file-reader';

describe('fileReader', () => {
  const NOT_EXIST_DIR = './do-not-exits-themes-async';
  beforeAll(() => clear(NOT_EXIST_DIR));
  afterAll(() => clear(NOT_EXIST_DIR));

  it('async: should create a default light.json', async () => {
    const { themes } = await fileReader({
      dir: NOT_EXIST_DIR,
    });
    expect(themes.length).toBe(1);
    expect(themes).toMatchInlineSnapshot(`
      [
        {
          "isDark": false,
          "name": "light",
          "themeOverrides": {},
        },
      ]
    `);

    await clear(NOT_EXIST_DIR);
  });

  it('async: should read a default.light.json', async () => {
    const { themes } = await fileReader({
      dir: './packages/naive-ui-themes/test/fixtures/themes',
    });
    expect(themes.length).toBe(2);
    expect(themes).toMatchInlineSnapshot(`
      [
        {
          "isDark": true,
          "name": "default.dark",
          "themeOverrides": {
            "common": {
              "primaryColor": "red",
            },
          },
        },
        {
          "isDark": false,
          "name": "default.light",
          "themeOverrides": {
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
      ]
    `);
  });
});

describe('unsafeFileReaderSync', () => {
  const NOT_EXIST_DIR = './do-not-exits-themes-sync';
  beforeAll(() => clear(NOT_EXIST_DIR));
  afterAll(() => clear(NOT_EXIST_DIR));

  it('sync: should create a default light.json', async () => {
    await sleep(100);

    const { themes } = unsafeFileReaderSync({
      dir: NOT_EXIST_DIR,
    });
    expect(themes.length).toBe(1);
    expect(themes).toMatchInlineSnapshot(`
      [
        {
          "isDark": false,
          "name": "light",
          "themeOverrides": {},
        },
      ]
    `);

    await clear(NOT_EXIST_DIR);
  });

  it('sync: should read a default.light.json', async () => {
    await sleep(50);
    const { themes } = unsafeFileReaderSync({
      dir: './packages/naive-ui-themes/test/fixtures/themes',
    });
    expect(themes.length).toBe(1);
    expect(themes).toMatchInlineSnapshot(`
      [
        {
          "isDark": false,
          "name": "default.light",
          "themeOverrides": {
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
      ]
    `);
  });
});

async function clear(path) {
  try {
    await readdir(resolve(path));
    await rm(resolve(path), { recursive: true, force: !!1 });
  } catch (error) {}
}
