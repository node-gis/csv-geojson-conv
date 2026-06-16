import type { FeatureCollection, Point } from 'geojson';
export interface CSVtoGeoJSONOptions {
    latitudeColumnName?: string;
    longitudeColumnName?: string;
}
type CSVRecord = Record<string, string>;
declare function CSVtoGeoJSON(strCsv: string, options?: CSVtoGeoJSONOptions): FeatureCollection<Point, CSVRecord>;
export default CSVtoGeoJSON;
//# sourceMappingURL=index.d.ts.map