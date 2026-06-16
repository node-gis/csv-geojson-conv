import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import csvToGeojson, { csvToGeoJSON, csvToTopoJSON } from "../src";

interface PointGeometry {
    type: string;
    coordinates: [number, number];
    properties: Record<string, string>;
}

function pointGeometries(topo: ReturnType<typeof csvToTopoJSON>, name: string): PointGeometry[] {
    return (topo.objects[name] as unknown as { geometries: PointGeometry[] }).geometries;
}

describe("csvToGeojson", () => {
    test("converts CSV rows to GeoJSON point features with numeric coordinates", () => {
        const csvfile = resolve(__dirname, "./data/repeater.csv");
        const csv = readFileSync(csvfile, "utf8");
        const geojson = csvToGeojson(csv);

        expect(geojson.type).toBe("FeatureCollection");
        expect(geojson.features.length).toBeGreaterThan(0);
        expect(geojson.features[0].geometry.coordinates).toEqual([126.9388092, 37.4355672]);
        expect(typeof geojson.features[0].geometry.coordinates[0]).toBe("number");
        expect(geojson.features[0].properties.Region).toBe("서울");
    });

    test("supports custom coordinate column names", () => {
        const geojson = csvToGeojson("lat,lon,name\n37.1,127.2,test", {
            latitudeColumnName: "lat",
            longitudeColumnName: "lon",
        });

        expect(geojson.features[0].geometry.coordinates).toEqual([127.2, 37.1]);
        expect(geojson.features[0].properties.name).toBe("test");
    });

    test("throws when a coordinate column is missing", () => {
        expect(() => csvToGeojson("Latitude,name\n37.1,test")).toThrow(
            'Missing coordinate column "Longitude" at CSV row 2',
        );
    });

    test("throws when a coordinate value is invalid", () => {
        expect(() => csvToGeojson("Latitude,Longitude\nnot-a-number,127.2")).toThrow(
            'Invalid coordinate value "not-a-number" in column "Latitude" at CSV row 2',
        );
    });

    test("throws when latitude is out of range", () => {
        expect(() => csvToGeojson("Latitude,Longitude\n99,127.2")).toThrow(
            'Out-of-range latitude "99" in column "Latitude" at CSV row 2 (expected -90..90)',
        );
    });

    test("throws when longitude is out of range", () => {
        expect(() => csvToGeojson("Latitude,Longitude\n37.1,-200")).toThrow(
            'Out-of-range longitude "-200" in column "Longitude" at CSV row 2 (expected -180..180)',
        );
    });

    test("throws on empty coordinate instead of emitting [0,0]", () => {
        expect(() => csvToGeojson("Latitude,Longitude,name\n,,x")).toThrow(
            'Empty coordinate value in column "Longitude" at CSV row 2',
        );
        expect(() => csvToGeojson("Latitude,Longitude\n  ,127.2")).toThrow(
            'Empty coordinate value in column "Latitude" at CSV row 2',
        );
    });

    test("handles CRLF line endings", () => {
        const geojson = csvToGeojson("Latitude,Longitude,name\r\n37.1,127.2,a\r\n35.0,129.0,b");
        expect(geojson.features.length).toBe(2);
        expect(geojson.features[1].properties.name).toBe("b");
    });

    test("handles quoted fields containing commas", () => {
        const geojson = csvToGeojson('Latitude,Longitude,address\n37.1,127.2,"Seoul, Korea"');
        expect(geojson.features[0].properties.address).toBe("Seoul, Korea");
    });

    test("returns an empty FeatureCollection for a header-only CSV", () => {
        const geojson = csvToGeojson("Latitude,Longitude,name");
        expect(geojson.type).toBe("FeatureCollection");
        expect(geojson.features).toEqual([]);
    });

    test("throws on a ragged row with the wrong column count", () => {
        expect(() => csvToGeojson("Latitude,Longitude,name\n37.1,127.2")).toThrow();
    });

    test("strips a UTF-8 BOM from the header (Excel/Windows CSVs)", () => {
        const geojson = csvToGeojson("﻿Latitude,Longitude\n37.1,127.2");
        expect(geojson.features[0].geometry.coordinates).toEqual([127.2, 37.1]);
    });

    test("exposes a named export equal to the default export", () => {
        expect(csvToGeoJSON).toBe(csvToGeojson);
        const geojson = csvToGeoJSON("Latitude,Longitude\n37.1,127.2");
        expect(geojson.features[0].geometry.coordinates).toEqual([127.2, 37.1]);
    });
});

describe("csvToTopoJSON", () => {
    test("converts CSV to a TopoJSON Topology", () => {
        const topo = csvToTopoJSON("Latitude,Longitude,name\n37.1,127.2,a");

        expect(topo.type).toBe("Topology");
        expect(Object.keys(topo.objects)).toEqual(["points"]);
        const geom = pointGeometries(topo, "points")[0];
        expect(geom.type).toBe("Point");
        expect(geom.coordinates).toEqual([127.2, 37.1]);
        expect(geom.properties.name).toBe("a");
    });

    test("uses a custom object name", () => {
        const topo = csvToTopoJSON("Latitude,Longitude\n37.1,127.2", { objectName: "stations" });
        expect(Object.keys(topo.objects)).toEqual(["stations"]);
    });

    test("honors custom coordinate column names", () => {
        const topo = csvToTopoJSON("lat,lon\n37.1,127.2", {
            latitudeColumnName: "lat",
            longitudeColumnName: "lon",
        });
        const geom = pointGeometries(topo, "points")[0];
        expect(geom.coordinates).toEqual([127.2, 37.1]);
    });

    test("propagates coordinate validation errors", () => {
        expect(() => csvToTopoJSON("Latitude,Longitude\n99,127.2")).toThrow("Out-of-range latitude");
    });

    test("rejects an empty objectName", () => {
        expect(() => csvToTopoJSON("Latitude,Longitude\n37.1,127.2", { objectName: "" })).toThrow(
            "objectName must not be empty",
        );
    });

    test("computes a bbox over all points", () => {
        const topo = csvToTopoJSON("Latitude,Longitude\n37.1,127.2\n35.0,129.0");
        expect(topo.bbox).toEqual([127.2, 35, 129, 37.1]);
    });
});
