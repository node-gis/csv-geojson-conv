# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- TopoJSON output: new named export `csvToTopoJSON(csv, options)` (with an
  `objectName` option, default `"points"`) and a CLI `-f, --format
  geojson|topojson` flag. Built in-house (no heavy runtime dependency) since
  point data needs no arcs; output is an unquantized `Topology` with a bbox.

## [1.0.0-beta.6]

### Added

- `exports` map for correct dual ESM/CJS resolution, plus per-directory
  `package.json` type markers in the build output.
- Named export `csvToGeoJSON` so CommonJS consumers can write
  `const { csvToGeoJSON } = require('@node-gis/csv-geojson-conv')`.
- `engines` field (`node >= 18`).
- `.gitattributes` to normalize line endings to LF.
- Source files shipped in the published package so source maps resolve.
- CLI: `--flag=value` syntax and a bare `-` to read from stdin.
- Biome lint/format with `lint`/`format` scripts and a CI lint job.
- CI test matrix on Node 18/20/22 plus a consumer smoke test that
  exercises the built package as CJS, ESM, and CLI.
- npm publish provenance on release.
- Expanded npm keywords and a clearer package description.

### Changed

- Coordinate validation now throws on empty/whitespace values instead of
  silently emitting `[0, 0]` (Null Island).
- CSV parsing strips a UTF-8 BOM so Excel/Windows exports work.

### Fixed

- CLI now rejects options with a missing value, guards against hanging on
  an interactive TTY, and no longer writes a file named after a flag.

## [1.0.0-beta.5]

### Added

- CLI runnable via `npx` / `bunx` / `pnpm dlx` / `yarn dlx`.

### Changed

- Package scoped as `@node-gis/csv-geojson-conv`.
- README rewritten in English, leading with the CSV → GeoJSON value
  proposition and a no-install quick start.

[Unreleased]: https://github.com/node-gis/csv-geojson-conv/compare/v1.0.0-beta.6...HEAD
[1.0.0-beta.6]: https://github.com/node-gis/csv-geojson-conv/compare/v1.0.0-beta.5...v1.0.0-beta.6
[1.0.0-beta.5]: https://github.com/node-gis/csv-geojson-conv/releases/tag/v1.0.0-beta.5
