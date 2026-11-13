import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  build: { license: { fileName: 'THIRD-PARTY-LICENSES.md' } },
  test: { include: ['tests/unit/**/*.test.ts'] },
});
