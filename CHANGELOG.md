# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `exports` map for correct dual ESM/CJS resolution, plus per-directory
  `package.json` type markers in the build output.
- Named export `csvToGeoJSON` so CommonJS consumers can write
  `const { csvToGeoJSON } = require('@node-gis/csv-geojson-conv')`.
- `engines` field (`node >= 18`).
- `.gitattributes` to normalize line endings to LF.
- Source files shipped in the published package so source maps resolve.

### Changed

- Coordinate validation now throws on empty/whitespace values instead of
  silently emitting `[0, 0]` (Null Island).

## [1.0.0-beta.5]

### Added

- CLI runnable via `npx` / `bunx` / `pnpm dlx` / `yarn dlx`.

### Changed

- Package scoped as `@node-gis/csv-geojson-conv`.
- README rewritten in English, leading with the CSV → GeoJSON value
  proposition and a no-install quick start.

[Unreleased]: https://github.com/node-gis/csv-geojson-conv/compare/v1.0.0-beta.5...HEAD
[1.0.0-beta.5]: https://github.com/node-gis/csv-geojson-conv/releases/tag/v1.0.0-beta.5
