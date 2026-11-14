import { expect, it } from 'vitest';
import { contrastRatio } from '../../src/accessibility/contrast';
import { repairContrast } from '../../src/accessibility/audit';
import { createExport } from '../../src/exporters/files';
import starter from '../../src/themes/default.json';

it('escapes theme names in HTML and XML', () => {
  const palette = { ...starter, name: '<Cloud> & "Sky"' };
  expect(createExport(palette, 'HTML').text).toContain('&lt;Cloud&gt; &amp; &quot;Sky&quot;');
  expect(createExport(palette, 'XML').text).toContain('name="&lt;Cloud&gt; &amp; &quot;Sky&quot;"');
});

it('exports structured color tokens', () => {
  expect(JSON.parse(createExport(starter, 'Design tokens').text).colors.foreground)
    .toEqual({ $type: 'color', $value: { colorSpace: 'srgb', components: [1, 1, 1], hex: '#FFFFFF' } });
});

it('suggests an exported sRGB color that meets the target', () => {
  const repair = repairContrast('#AAAAAA', '#FFFFFF', 4.5);
  expect(contrastRatio(repair!, '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
});
