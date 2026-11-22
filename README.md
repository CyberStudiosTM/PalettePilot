<div align="center">

# 🎨 PalettePilot

**Pick a color. Find its harmony. Fly it everywhere.**

*A palette editor with OKLCH harmonies, WCAG contrast checks, and a live theme preview.*

**A CyberStudios™ creative tool**

![Version](https://img.shields.io/badge/Version-0.1.0-C6B6F3?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-24-AED8F5?style=for-the-badge&logo=nodedotjs&logoColor=202842)
![License](https://img.shields.io/badge/License-MIT-A8E8DC?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Browser%20%C2%B7%20Windows%20x64-F4C8EA?style=for-the-badge)

[Getting Started](#-getting-started) · [How It Works](#-how-it-works) · [Exports](#-take-a-palette-with-you) · [Desktop App](#-windows-desktop-app) · [Contributing](CONTRIBUTING.md)

</div>

---

## ✦ Welcome to PalettePilot

Every little world needs its colors.

**PalettePilot** helps you build a palette swatch by swatch, generate harmonies that actually look good together, check that your text stays readable, and preview how everything feels as a real theme.

**Know your colors look good. Know they're readable.**

### What can it do?

| | Feature | Description |
| :---: | :--- | :--- |
| 🎨 | **2–12 swatches** | Edit with the color picker or type six-digit HEX values. |
| 🌈 | **Harmonies** | Complementary, analogous, triadic, or monochromatic, from any base swatch. |
| 🔒 | **Locks** | Locked swatches and the base keep their values when you generate. |
| ♿ | **Contrast checks** | WCAG AA and AAA for normal and large text. |
| 👀 | **Live preview** | Assign theme roles and see the theme come together. |
| 📦 | **Exports** | CyberStudios JSON, CSS, Swatch JSON, and GIMP GPL. |

---

## 🌱 Getting Started

**Requirements:** Node.js 24 and npm.

```sh
npm ci
npm run dev
```

**Editing your palette**

- Edit **2–12 swatches** using the color picker, or enter six-digit HEX values.
- Press **Enter** or leave a field to save your edit.
- Reorder swatches with the arrow buttons.
- Choose a **base swatch** and a **harmony**, then generate complementary, analogous, triadic, or monochromatic colors. Locked swatches and the base keep their values.

---

## 🔎 How It Works

### 01 / Color engine

Converts sRGB to **OKLCH**, then reduces chroma at the target hue and lightness until the color fits inside the sRGB gamut.

### 02 / Contrast checker

Uses the exported sRGB values and reports **AA** and **AAA** results for normal and large text.

> **Note:** Text contrast is one part of WCAG accessibility, not the whole picture.

Learn more: [Ottosson's Oklab definition](https://bottosson.github.io/posts/oklab/) · [WCAG 2.2 criteria 1.4.3 and 1.4.6](https://www.w3.org/TR/WCAG22/#contrast-minimum)

---

## ✈️ Take a Palette With You

Assign theme roles, check the live preview, then download:

| Format | Good for |
| :--- | :--- |
| **CyberStudios JSON** | [CloudTerminal](https://github.com/CyberStudiosTM/CloudTerminal) can preview and apply it |
| **CSS** | Websites and web apps |
| **Swatch JSON** | Your own tools and scripts |
| **GIMP GPL** | GIMP and other painting apps |

Use **Import JSON** to reopen a palette in PalettePilot.

Swatches, role assignments, and locks are saved in the browser. **Export a file to keep a portable copy.**

See the [palette format](docs/palette-v1.md) and the [sample palette](src/themes/default.json).

---

## 🖥️ Windows Desktop App

Extract the full Windows x64 package, then open **`PalettePilot.exe`** inside it.

Keep the executable and its supporting files in the same folder. The app runs offline and stores its settings locally.

**Build the Windows package from source:**

```sh
npm ci
npm run package:win
```

The executable and its supporting files are written to `dist-desktop/PalettePilot-win32-x64/`.

To run Electron from source, use `npm run build` followed by `npm run desktop`.

---

## 🛠️ Verify

```sh
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

> **Note:** The production output in `dist/` uses relative asset URLs, so it can be served from a static site or a subdirectory. The GitHub workflow runs checks only.

---

<div align="center">

### ✿ Made in Cyberspace

PalettePilot is part of **CyberStudios™**, a creative software ecosystem of developer tools, digital art, and little interactive worlds.

Its terminal partner is **[CloudTerminal](https://github.com/CyberStudiosTM/CloudTerminal)** ☁️

[Repository](https://github.com/CyberStudiosTM/PalettePilot) · [Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md) · [CyberStudios](https://github.com/CyberStudiosTM)

Licensed under the [MIT License](LICENSE).

*Every little world deserves its colors.* 🎨

</div>
