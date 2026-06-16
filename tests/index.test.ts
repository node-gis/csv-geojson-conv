import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { resolve } from "path";

import csvToGeojson from "../src";

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
});
