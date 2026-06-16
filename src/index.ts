import { parse } from "csv-parse/sync";
import type { BBox, Feature, FeatureCollection, Point } from "geojson";
import type { GeometryCollection, Topology, Point as TopoPoint } from "topojson-specification";

export interface CSVtoGeoJSONOptions {
    latitudeColumnName?: string;
    longitudeColumnName?: string;
}

export interface CSVtoTopoJSONOptions extends CSVtoGeoJSONOptions {
    /** Name of the object/layer in the TopoJSON output. Defaults to "points". */
    objectName?: string;
}
type CSVRecord = Record<string, string>;

type Axis = "latitude" | "longitude";

function readCoordinate(row: CSVRecord, columnName: string, rowIndex: number, axis: Axis): number {
    const rawValue = row[columnName];

    if (rawValue === undefined) {
        throw new Error(`Missing coordinate column "${columnName}" at CSV row ${rowIndex + 2}`);
    }

    if (rawValue.trim() === "") {
        throw new Error(`Empty coordinate value in column "${columnName}" at CSV row ${rowIndex + 2}`);
    }

    const value = Number(rawValue);
    if (!Number.isFinite(value)) {
        throw new Error(
            `Invalid coordinate value "${rawValue}" in column "${columnName}" at CSV row ${rowIndex + 2}`,
        );
    }

    const limit = axis === "latitude" ? 90 : 180;
    if (value < -limit || value > limit) {
        throw new Error(
            `Out-of-range ${axis} "${rawValue}" in column "${columnName}" at CSV row ${rowIndex + 2} (expected -${limit}..${limit})`,
        );
    }

    return value;
}

function CSVtoGeoJSON(strCsv: string, options?: CSVtoGeoJSONOptions): FeatureCollection<Point, CSVRecord> {
    const { latitudeColumnName = "Latitude", longitudeColumnName = "Longitude" } = options || {};

    // `bom: true` strips a UTF-8 BOM (common in Excel/Windows exports) so the
    // first header isn't read as "﻿Latitude" and coordinate lookup works.
    const records = parse(strCsv, {
        columns: true,
        trim: true,
        skip_empty_lines: true,
        bom: true,
    }) as CSVRecord[];

    const features: Feature<Point, CSVRecord>[] = records.map((row, rowIndex) => ({
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

function CSVtoTopoJSON(strCsv: string, options?: CSVtoTopoJSONOptions): Topology {
    const { objectName = "points", ...geoOptions } = options || {};
    if (objectName === "") {
        throw new Error("objectName must not be empty");
    }

    // Point features have no shared boundaries, so the TopoJSON has no arcs and
    // each point maps straight to a geometry. This avoids pulling in a topology
    // builder (and its transitive CLI dependency) just to wrap points.
    const { features } = CSVtoGeoJSON(strCsv, geoOptions);

    const geometries: TopoPoint[] = features.map((feature) => ({
        type: "Point",
        coordinates: feature.geometry.coordinates,
        properties: feature.properties,
    }));

    const collection: GeometryCollection = { type: "GeometryCollection", geometries };
    const topology: Topology = { type: "Topology", objects: { [objectName]: collection }, arcs: [] };

    const bbox = boundingBox(features);
    if (bbox) {
        topology.bbox = bbox;
    }

    return topology;
}

function boundingBox(features: Feature<Point, CSVRecord>[]): BBox | undefined {
    if (features.length === 0) {
        return undefined;
    }

    let minLon = Infinity;
    let minLat = Infinity;
    let maxLon = -Infinity;
    let maxLat = -Infinity;

    for (const feature of features) {
        const [lon, lat] = feature.geometry.coordinates;
        if (lon < minLon) minLon = lon;
        if (lat < minLat) minLat = lat;
        if (lon > maxLon) maxLon = lon;
        if (lat > maxLat) maxLat = lat;
    }

    return [minLon, minLat, maxLon, maxLat];
}

export default CSVtoGeoJSON;
// Named exports so CommonJS consumers can write
// `const { csvToGeoJSON, csvToTopoJSON } = require('@node-gis/csv-geojson-conv')`.
export { CSVtoGeoJSON as csvToGeoJSON, CSVtoTopoJSON as csvToTopoJSON };
