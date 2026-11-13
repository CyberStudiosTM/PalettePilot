# CyberStudios Palette JSON v1

A palette travels as a UTF-8 JSON file. CloudTerminal and PalettePilot each implement this contract locally.

| Field | Required | Value |
| --- | --- | --- |
| `schemaVersion` | Yes | A string in the form `1.<minor>`. New exports use `1.0`. |
| `id`, `name` | Yes | Non-empty strings |
| `colors` | Yes | Non-empty array of objects, each with a unique non-empty `id`, non-empty `name`, and `hex` matching `#RRGGBB` |
| `roles` | Yes | Object mapping role names to existing, case-sensitive swatch IDs |
| `author` | Optional | Explicitly supplied author text |

Required roles are `background`, `surface`, `foreground`, and `accent`. Optional roles are `muted`, `success`, `warning`, and `error`. Several roles can reference the same swatch. Missing `muted` falls back to `foreground`. Missing status roles fall back to `accent`.

Compatible 1.x versions may add properties or roles. Readers ignore unknown metadata and validate all role references. PalettePilot limits editing to 2–12 swatches. CloudTerminal accepts any non-empty palette up to the local file size limit of 256 KiB.

Use the [CyberCore Cloud sample](../src/themes/default.json) or the [contract fixtures](../tests/fixtures/palettes.json) to verify another implementation.
