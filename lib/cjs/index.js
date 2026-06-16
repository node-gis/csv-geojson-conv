"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.csvToGeoJSON = CSVtoGeoJSON;
exports.csvToTopoJSON = CSVtoTopoJSON;
const sync_1 = require("csv-parse/sync");
const topojson_server_1 = require("topojson-server");
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
    const records = (0, sync_1.parse)(strCsv, {
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
function CSVtoTopoJSON(strCsv, options) {
    const { objectName = "points", ...geoOptions } = options || {};
    const featureCollection = CSVtoGeoJSON(strCsv, geoOptions);
    return (0, topojson_server_1.topology)({ [objectName]: featureCollection });
}
exports.default = CSVtoGeoJSON;
//# sourceMappingURL=index.js.map