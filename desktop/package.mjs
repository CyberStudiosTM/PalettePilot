import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packager } from '@electron/packager';

const root = fileURLToPath(new URL('..', import.meta.url));
const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const staging = await mkdtemp(path.join(tmpdir(), 'palettepilot-'));
try {
  await writeFile(path.join(staging, 'package.json'), JSON.stringify({
    name: manifest.name,
    productName: 'PalettePilot',
    version: manifest.version,
    license: 'MIT',
    main: 'desktop/main.cjs',
  }, null, 2) + '\n');
  await cp(path.join(root, 'desktop', 'main.cjs'), path.join(staging, 'desktop', 'main.cjs'));
  await cp(path.join(root, 'desktop', 'preload.cjs'), path.join(staging, 'desktop', 'preload.cjs'));
  await cp(path.join(root, 'dist'), path.join(staging, 'dist'), { recursive: true });
  await cp(path.join(root, 'LICENSE'), path.join(staging, 'LICENSE'));
  const [output] = await packager({
    dir: staging,
    out: path.join(root, 'dist-desktop'),
    name: 'PalettePilot',
    executableName: 'PalettePilot',
    icon: path.join(root, 'desktop', 'app.ico'),
    appCopyright: 'Copyright (c) 2026 CyberStudios',
    appBundleId: 'studio.cyberstudios.palettepilot',
    platform: 'win32',
    arch: 'x64',
    electronVersion: manifest.devDependencies.electron,
    asar: true,
    overwrite: true,
    prune: false,
    win32metadata: { CompanyName: 'CyberStudios', FileDescription: 'PalettePilot', ProductName: 'PalettePilot' },
  });
  console.log(path.relative(root, output));
} finally {
  await rm(staging, { recursive: true, force: true });
}
