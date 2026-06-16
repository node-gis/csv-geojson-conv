# csv-geojson-conv

[![CI](https://github.com/node-gis/csv-geojson-conv/actions/workflows/ci.yml/badge.svg)](https://github.com/node-gis/csv-geojson-conv/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/csv-geojson-conv.svg)](https://www.npmjs.com/package/csv-geojson-conv)
[![npm downloads](https://img.shields.io/npm/dm/csv-geojson-conv.svg)](https://www.npmjs.com/package/csv-geojson-conv)
[![license](https://img.shields.io/npm/l/csv-geojson-conv.svg)](https://github.com/node-gis/csv-geojson-conv/blob/main/LICENSE)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fnode-gis%2Fcsv-geojson-conv.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fnode-gis%2Fcsv-geojson-conv?ref=badge_shield)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fnode-gis%2Fcsv-geojson-conv.svg?type=shield&issueType=security)](https://app.fossa.com/projects/git%2Bgithub.com%2Fnode-gis%2Fcsv-geojson-conv?ref=badge_shield&issueType=security)

A tiny ESM/CJS module that converts a CSV string into a GeoJSON `FeatureCollection` of `Point` features. Works in Node.js and the browser. Ships with TypeScript types.

## Install

```sh
npm install csv-geojson-conv
# or
yarn add csv-geojson-conv
# or
bun add csv-geojson-conv
```

## Usage

```js
// ESM
import csvToGeojson from 'csv-geojson-conv';
// CommonJS
const csvToGeojson = require('csv-geojson-conv');

const csv = `Latitude,Longitude,Region,Name,Note
37.4355672,126.9388092,서울,서울본부,
35.0819546,129.0552017,부산,KBS중계소,`;

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
      "properties": { "Latitude": "37.4355672", "Longitude": "126.9388092", "Region": "서울", "Name": "서울본부", "Note": "" }
    }
  ]
}
```

### Browser (fetch)

```js
import csvToGeojson from 'csv-geojson-conv';

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

## API

```ts
function csvToGeojson(
  csv: string,
  options?: {
    latitudeColumnName?: string;  // default: "Latitude"
    longitudeColumnName?: string; // default: "Longitude"
  }
): FeatureCollection<Point, Record<string, string>>;
```

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
