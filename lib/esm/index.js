import { parse } from 'csv-parse/sync';
function readCoordinate(row, columnName, rowIndex) {
    const rawValue = row[columnName];
    if (rawValue === undefined) {
        throw new Error(`Missing coordinate column "${columnName}" at CSV row ${rowIndex + 2}`);
    }
    const value = Number(rawValue);
    if (!Number.isFinite(value)) {
        throw new Error(`Invalid coordinate value "${rawValue}" in column "${columnName}" at CSV row ${rowIndex + 2}`);
    }
    return value;
}
function CSVtoGeoJSON(strCsv, options) {
    const { latitudeColumnName = "Latitude", longitudeColumnName = "Longitude" } = options || {};
    const records = parse(strCsv, { columns: true, trim: true, skip_empty_lines: true });
    const features = records.map((row, rowIndex) => ({
        type: "Feature",
        properties: row,
        geometry: {
            type: "Point",
            coordinates: [
                readCoordinate(row, longitudeColumnName, rowIndex),
                readCoordinate(row, latitudeColumnName, rowIndex),
            ],
        },
    }));
    return { type: "FeatureCollection", features };
}
export default CSVtoGeoJSON;
//# sourceMappingURL=index.js.map