# PalettePilot

A CyberStudios™ palette editor with OKLCH harmony generation, WCAG text contrast checks, and a live preview of theme roles.

## Windows desktop app

Extract the full Windows x64 package, then open `PalettePilot.exe` inside it. Keep the executable and its supporting files in the same folder. The app runs offline and stores its settings locally.

To build the Windows package from source, run:

```sh
npm ci
npm run package:win
```

The executable and its supporting files are written to `dist-desktop/PalettePilot-win32-x64/`. Use `npm run build` followed by `npm run desktop` to run Electron from source.

## Run locally

Use Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Edit 2–12 swatches using the color picker or enter six-digit HEX values. Press Enter or leave a field to save your edit. Reorder swatches with the arrow buttons. Choose a base swatch and a harmony, then generate complementary, analogous, triadic, or monochromatic colors. Locked swatches and the base keep their values.

The color engine converts sRGB to OKLCH and reduces chroma at the target hue and lightness to fit the sRGB gamut. The contrast checker uses the exported sRGB values and reports AA and AAA for normal and large text. Text contrast is one part of WCAG accessibility. See [Ottosson's Oklab definition](https://bottosson.github.io/posts/oklab/) and [WCAG 2.2 criteria 1.4.3 and 1.4.6](https://www.w3.org/TR/WCAG22/#contrast-minimum).

## Take a palette with you

Assign theme roles, check the live preview, then download **CyberStudios JSON**, **CSS**, **Swatch JSON**, or **GIMP GPL**. CloudTerminal can preview and apply CyberStudios JSON files. Use **Import JSON** to reopen one in PalettePilot. Swatches, role assignments, and locks are saved in the browser. Export a file to keep a portable copy.

See the [palette format](docs/palette-v1.md) and [sample palette](src/themes/default.json).

## Verify

```sh
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

The production output in `dist/` uses relative asset URLs and can be served from a static site or a subdirectory. The GitHub workflow runs checks only.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [LICENSE](LICENSE).
