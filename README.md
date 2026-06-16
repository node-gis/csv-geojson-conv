# @node-gis/csv-geojson-conv

[![CI](https://github.com/node-gis/csv-geojson-conv/actions/workflows/ci.yml/badge.svg)](https://github.com/node-gis/csv-geojson-conv/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@node-gis/csv-geojson-conv.svg)](https://www.npmjs.com/package/@node-gis/csv-geojson-conv)
[![npm downloads](https://img.shields.io/npm/dm/@node-gis/csv-geojson-conv.svg)](https://www.npmjs.com/package/@node-gis/csv-geojson-conv)
[![license](https://img.shields.io/npm/l/@node-gis/csv-geojson-conv.svg)](https://github.com/node-gis/csv-geojson-conv/blob/main/LICENSE)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fnode-gis%2Fcsv-geojson-conv.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fnode-gis%2Fcsv-geojson-conv?ref=badge_shield)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fnode-gis%2Fcsv-geojson-conv.svg?type=shield&issueType=security)](https://app.fossa.com/projects/git%2Bgithub.com%2Fnode-gis%2Fcsv-geojson-conv?ref=badge_shield&issueType=security)

**Turn a CSV into GeoJSON or TopoJSON in one call — or one command.** Point it at any CSV with latitude/longitude columns and get back a valid GeoJSON `FeatureCollection` of `Point` features (or a TopoJSON `Topology`), ready to drop onto a map.

- 🗺️ **CSV → GeoJSON or TopoJSON, instantly.** Latitude/longitude columns become coordinates; every other column becomes a feature property.
- ⚡ **Zero config.** Sensible `Latitude` / `Longitude` defaults, overridable for any column names.
- 🧰 **Library _and_ CLI.** Call it from code, or run it with `npx` / `bunx` / `pnpm dlx` — no install required.
- 📦 **ESM + CJS + TypeScript types.** Works in Node.js and the browser.
- ✅ **Safe by default.** Validates coordinates and throws clear, row-numbered errors on bad data.

## Quick start (no install)

Run the converter directly with your package manager's runner:

```sh
# npm
npx @node-gis/csv-geojson-conv points.csv > points.geojson

# bun
bunx @node-gis/csv-geojson-conv points.csv > points.geojson

# pnpm
pnpm dlx @node-gis/csv-geojson-conv points.csv > points.geojson

# yarn (v2+) — there is no `yarnx`; use `yarn dlx`
yarn dlx @node-gis/csv-geojson-conv points.csv > points.geojson
```

## Install

To use it as a library (or to get a local `csv-geojson-conv` command):

```sh
npm install @node-gis/csv-geojson-conv
# or
yarn add @node-gis/csv-geojson-conv
# or
bun add @node-gis/csv-geojson-conv
```

## CLI

```text
csv-geojson-conv [options] [file]

Reads CSV from <file> (or from stdin when no file is given) and writes a
GeoJSON FeatureCollection (or a TopoJSON Topology) of Point features to stdout.

Options:
  -f, --format <fmt>   output format: geojson | topojson  (default: geojson)
  --latitude <name>    latitude column name   (default: Latitude)
  --longitude <name>   longitude column name  (default: Longitude)
  -o, --output <file>  write to a file instead of stdout
  --pretty             pretty-print the JSON output
  -h, --help           show help
  -v, --version        show version
```

Options accept both `--flag value` and `--flag=value` forms. A bare `-` reads from stdin.

Examples:

```sh
# Convert a file and pretty-print to a new file
npx @node-gis/csv-geojson-conv points.csv --pretty -o points.geojson

# Output TopoJSON instead of GeoJSON
npx @node-gis/csv-geojson-conv points.csv --format topojson -o points.topojson

# Pipe CSV in via stdin, with custom column names (--flag=value form)
cat points.csv | npx @node-gis/csv-geojson-conv --latitude=lat --longitude=lon
```

> **Windows / PowerShell:** prefer `-o <file>` over `>` redirection. PowerShell's
> `>` re-encodes the tool's UTF-8 output through the console code page, which
> corrupts non-ASCII text (e.g. Korean). `-o` writes UTF-8 directly:
>
> ```powershell
> npx @node-gis/csv-geojson-conv points.csv -o points.geojson
> ```

## Library usage

```js
// ESM (default or named import)
import csvToGeojson from '@node-gis/csv-geojson-conv';
// import { csvToGeoJSON } from '@node-gis/csv-geojson-conv';

// CommonJS (use the named export)
const { csvToGeoJSON: csvToGeojson } = require('@node-gis/csv-geojson-conv');

const csv = `Latitude,Longitude,name,category
37.4355672,126.9388092,Seoul HQ,office
35.0819546,129.0552017,Busan Branch,office`;

const geojson = csvToGeojson(csv);
```

Result:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [126.9388092, 37.4355672] },
      "properties": { "Latitude": "37.4355672", "Longitude": "126.9388092", "name": "Seoul HQ", "category": "office" }
    }
  ]
}
```

### Browser (fetch)

```js
import csvToGeojson from '@node-gis/csv-geojson-conv';

fetch('data/points.csv')
  .then((res) => res.text())
  .then((csv) => {
    const geojson = csvToGeojson(csv);
    // ... render on a map
  });
```

### Custom coordinate columns

Default columns are `Latitude` and `Longitude`. Override them when your CSV differs:

```js
const geojson = csvToGeojson(csv, {
  latitudeColumnName: 'lat',
  longitudeColumnName: 'lon',
});
```

### TopoJSON output

Use the named `csvToTopoJSON` export to get a TopoJSON `Topology` instead:

```js
import { csvToTopoJSON } from '@node-gis/csv-geojson-conv';
// CommonJS: const { csvToTopoJSON } = require('@node-gis/csv-geojson-conv');

const topology = csvToTopoJSON(csv, { objectName: 'points' });
// { type: "Topology", objects: { points: { type: "GeometryCollection", ... } }, ... }
```

`objectName` (default `"points"`) names the layer/object in the output. The same coordinate-column options apply. The `Topology` is unquantized (lossless); post-process with [`topoquantize`](https://github.com/topojson/topojson-client) if you want smaller files.

## API

```ts
function csvToGeojson(
  csv: string,
  options?: {
    latitudeColumnName?: string;  // default: "Latitude"
    longitudeColumnName?: string; // default: "Longitude"
  }
): FeatureCollection<Point, Record<string, string>>;

function csvToTopoJSON(
  csv: string,
  options?: {
    latitudeColumnName?: string;  // default: "Latitude"
    longitudeColumnName?: string; // default: "Longitude"
    objectName?: string;          // default: "points"
  }
): Topology; // from topojson-specification
```

- `csvToGeojson` is the default export; `csvToGeoJSON` and `csvToTopoJSON` are named exports.
- The latitude/longitude columns become each feature's `Point` coordinates (GeoJSON order: `[longitude, latitude]`).
- Every other column is copied verbatim into the feature's `properties` (values stay strings).
- Empty lines are skipped; whitespace around values is trimmed.

### Errors

Conversion throws an `Error` (with the offending CSV row number) when:

- a coordinate column is missing,
- a coordinate value is not a finite number, or
- a coordinate is outside the valid WGS84 range (latitude `-90..90`, longitude `-180..180`).

## LICENSE

Licensed [MIT](https://github.com/node-gis/csv-geojson-conv/blob/main/LICENSE)

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fnode-gis%2Fcsv-geojson-conv.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fnode-gis%2Fcsv-geojson-conv?ref=badge_large)
