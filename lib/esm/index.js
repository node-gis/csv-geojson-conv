import { parse } from "csv-parse/sync";
function readCoordinate(row, columnName, rowIndex, axis) {
    const rawValue = row[columnName];
    if (rawValue === undefined) {
        throw new Error(`Missing coordinate column "${columnName}" at CSV row ${rowIndex + 2}`);
    }
    if (rawValue.trim() === "") {
        throw new Error(`Empty coordinate value in column "${columnName}" at CSV row ${rowIndex + 2}`);
    }
    const value = Number(rawValue);
    if (!Number.isFinite(value)) {
        throw new Error(`Invalid coordinate value "${rawValue}" in column "${columnName}" at CSV row ${rowIndex + 2}`);
    }
    const limit = axis === "latitude" ? 90 : 180;
    if (value < -limit || value > limit) {
        throw new Error(`Out-of-range ${axis} "${rawValue}" in column "${columnName}" at CSV row ${rowIndex + 2} (expected -${limit}..${limit})`);
    }
    return value;
}
function CSVtoGeoJSON(strCsv, options) {
    const { latitudeColumnName = "Latitude", longitudeColumnName = "Longitude" } = options || {};
    // `bom: true` strips a UTF-8 BOM (common in Excel/Windows exports) so the
    // first header isn't read as "﻿Latitude" and coordinate lookup works.
    const records = parse(strCsv, {
        columns: true,
        trim: true,
        skip_empty_lines: true,
        bom: true,
    });
    const features = records.map((row, rowIndex) => ({
        type: "Feature",
        properties: row,
        geometry: {
            type: "Point",
            coordinates: [
                readCoordinate(row, longitudeColumnName, rowIndex, "longitude"),
                readCoordinate(row, latitudeColumnName, rowIndex, "latitude"),
            ],
        },
    }));
    return { type: "FeatureCollection", features };
}
export default CSVtoGeoJSON;
// Named export so CommonJS consumers can write
// `const { csvToGeoJSON } = require('@node-gis/csv-geojson-conv')`.
export { CSVtoGeoJSON as csvToGeoJSON };
//# sourceMappingURL=index.js.map