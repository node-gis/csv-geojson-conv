#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";

import CSVtoGeoJSON from "./index";

const pkg = require("../../package.json") as { name: string; version: string };

interface CliArgs {
    file?: string;
    latitude?: string;
    longitude?: string;
    output?: string;
    pretty: boolean;
    help: boolean;
    version: boolean;
}

const HELP = `${pkg.name} — convert CSV to GeoJSON

Usage:
  csv-geojson-conv [options] [file]

Reads CSV from <file> (or from stdin when no file is given) and writes a
GeoJSON FeatureCollection of Point features to stdout.

Options:
  --latitude <name>    latitude column name   (default: Latitude)
  --longitude <name>   longitude column name  (default: Longitude)
  -o, --output <file>  write GeoJSON to a file instead of stdout
  --pretty             pretty-print the JSON output
  -h, --help           show this help
  -v, --version        show version

Examples:
  csv-geojson-conv points.csv
  csv-geojson-conv points.csv --pretty -o points.geojson
  cat points.csv | csv-geojson-conv --latitude lat --longitude lon
`;

function parseArgs(argv: string[]): CliArgs {
    const args: CliArgs = { pretty: false, help: false, version: false };

    // Consume the value that follows an option, rejecting a missing value or
    // another flag (e.g. `--latitude --longitude` or a trailing `-o`).
    const takeValue = (i: number, flag: string): string => {
        const value = argv[i + 1];
        if (value === undefined || value.startsWith("-")) {
            throw new Error(`Missing value for ${flag}`);
        }
        return value;
    };

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        switch (arg) {
            case "-h":
            case "--help":
                args.help = true;
                break;
            case "-v":
            case "--version":
                args.version = true;
                break;
            case "--pretty":
                args.pretty = true;
                break;
            case "--latitude":
                args.latitude = takeValue(i++, arg);
                break;
            case "--longitude":
                args.longitude = takeValue(i++, arg);
                break;
            case "-o":
            case "--output":
                args.output = takeValue(i++, arg);
                break;
            default:
                if (arg.startsWith("-")) {
                    throw new Error(`Unknown option: ${arg}`);
                }
                if (args.file !== undefined) {
                    throw new Error(`Unexpected extra argument: ${arg}`);
                }
                args.file = arg;
        }
    }

    return args;
}

function main(): void {
    let args: CliArgs;
    try {
        args = parseArgs(process.argv.slice(2));
    } catch (err) {
        process.stderr.write(`${(err as Error).message}\n\n${HELP}`);
        process.exit(2);
    }

    if (args.help) {
        process.stdout.write(HELP);
        return;
    }
    if (args.version) {
        process.stdout.write(`${pkg.version}\n`);
        return;
    }

    // No file argument means read CSV from stdin (file descriptor 0).
    // Guard against an interactive terminal, where reading stdin would hang.
    if (args.file === undefined && process.stdin.isTTY) {
        process.stderr.write(`No input. Provide a CSV file or pipe CSV via stdin.\n\n${HELP}`);
        process.exit(2);
    }
    const csv = readFileSync(args.file ?? 0, "utf8");

    const geojson = CSVtoGeoJSON(csv, {
        latitudeColumnName: args.latitude,
        longitudeColumnName: args.longitude,
    });

    const json = JSON.stringify(geojson, null, args.pretty ? 2 : undefined);

    if (args.output) {
        writeFileSync(args.output, json + "\n");
    } else {
        process.stdout.write(json + "\n");
    }
}

try {
    main();
} catch (err) {
    process.stderr.write(`Error: ${(err as Error).message}\n`);
    process.exit(1);
}
