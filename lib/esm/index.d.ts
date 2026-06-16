import type { FeatureCollection, Point } from "geojson";
import type { Topology } from "topojson-specification";
export interface CSVtoGeoJSONOptions {
    latitudeColumnName?: string;
    longitudeColumnName?: string;
}
export interface CSVtoTopoJSONOptions extends CSVtoGeoJSONOptions {
    /** Name of the object/layer in the TopoJSON output. Defaults to "points". */
    objectName?: string;
}
type CSVRecord = Record<string, string>;
declare function CSVtoGeoJSON(strCsv: string, options?: CSVtoGeoJSONOptions): FeatureCollection<Point, CSVRecord>;
declare function CSVtoTopoJSON(strCsv: string, options?: CSVtoTopoJSONOptions): Topology;
export default CSVtoGeoJSON;
export { CSVtoGeoJSON as csvToGeoJSON, CSVtoTopoJSON as csvToTopoJSON };
//# sourceMappingURL=index.d.ts.map