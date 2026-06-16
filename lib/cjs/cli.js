#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const index_1 = __importDefault(require("./index"));
const pkg = require("../../package.json");
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

Options accept both "--flag value" and "--flag=value" forms. A bare "-" reads
from stdin.

Examples:
  csv-geojson-conv points.csv
  csv-geojson-conv points.csv --pretty -o points.geojson
  cat points.csv | csv-geojson-conv --latitude=lat --longitude=lon
`;
function parseArgs(argv) {
    const args = { stdin: false, pretty: false, help: false, version: false };
    for (let i = 0; i < argv.length; i++) {
        // Support GNU `--flag=value` syntax by splitting the inline value off.
        let arg = argv[i];
        let inline;
        if (arg.startsWith("--") && arg.includes("=")) {
            const eq = arg.indexOf("=");
            inline = arg.slice(eq + 1);
            arg = arg.slice(0, eq);
        }
        // Resolve a value for an option from either `--flag=value` or `--flag value`,
        // rejecting a missing value or one that looks like another flag.
        const valueFor = (flag) => {
            if (inline !== undefined) {
                if (inline === "")
                    throw new Error(`Missing value for ${flag}`);
                return inline;
            }
            const value = argv[i + 1];
            if (value === undefined || value.startsWith("-")) {
                throw new Error(`Missing value for ${flag}`);
            }
            i++;
            return value;
        };
        const noInline = (flag) => {
            if (inline !== undefined)
                throw new Error(`Option ${flag} does not take a value`);
        };
        switch (arg) {
            case "-h":
            case "--help":
                noInline(arg);
                args.help = true;
                break;
            case "-v":
            case "--version":
                noInline(arg);
                args.version = true;
                break;
            case "--pretty":
                noInline(arg);
                args.pretty = true;
                break;
            case "--latitude":
                args.latitude = valueFor(arg);
                break;
            case "--longitude":
                args.longitude = valueFor(arg);
                break;
            case "-o":
            case "--output":
                args.output = valueFor(arg);
                break;
            case "-":
                // A bare "-" is the conventional name for stdin.
                args.stdin = true;
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
function main() {
    let args;
    try {
        args = parseArgs(process.argv.slice(2));
    }
    catch (err) {
        process.stderr.write(`${err.message}\n\n${HELP}`);
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
    // No file argument means read CSV from stdin (file descriptor 0). Guard
    // against an interactive terminal — unless the user explicitly asked for
    // stdin with "-" — where reading stdin would hang.
    if (args.file === undefined && !args.stdin && process.stdin.isTTY) {
        process.stderr.write(`No input. Provide a CSV file or pipe CSV via stdin.\n\n${HELP}`);
        process.exit(2);
    }
    const csv = (0, node_fs_1.readFileSync)(args.file ?? 0, "utf8");
    const geojson = (0, index_1.default)(csv, {
        latitudeColumnName: args.latitude,
        longitudeColumnName: args.longitude,
    });
    const json = JSON.stringify(geojson, null, args.pretty ? 2 : undefined);
    if (args.output) {
        (0, node_fs_1.writeFileSync)(args.output, `${json}\n`);
    }
    else {
        process.stdout.write(`${json}\n`);
    }
}
try {
    main();
}
catch (err) {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exit(1);
}
//# sourceMappingURL=cli.js.map