// Consumer smoke test: verifies the *built* package can actually be consumed
// as CommonJS, as native ESM, and as a CLI — under whatever Node version runs
// this script. Guards the dual-package contract against regressions.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const CSV = "Latitude,Longitude\n37.1,127.2";
const EXPECTED = [127.2, 37.1];

// CommonJS consumption
const cjs = require("../lib/cjs/index.js");
assert.equal(typeof cjs.csvToGeoJSON, "function", "CJS named export should be a function");
assert.equal(typeof cjs.csvToTopoJSON, "function", "CJS csvToTopoJSON should be a function");
assert.equal(typeof cjs.default, "function", "CJS default export should be a function");
assert.deepEqual(cjs.csvToGeoJSON(CSV).features[0].geometry.coordinates, EXPECTED, "CJS GeoJSON");
assert.equal(cjs.csvToTopoJSON(CSV).type, "Topology", "CJS TopoJSON");

// Native ESM consumption
const esm = await import("../lib/esm/index.js");
assert.equal(typeof esm.default, "function", "ESM default export should be a function");
assert.equal(typeof esm.csvToGeoJSON, "function", "ESM named export should be a function");
assert.equal(typeof esm.csvToTopoJSON, "function", "ESM csvToTopoJSON should be a function");
assert.deepEqual(esm.default(CSV).features[0].geometry.coordinates, EXPECTED, "ESM GeoJSON");
assert.equal(esm.csvToTopoJSON(CSV).type, "Topology", "ESM TopoJSON");

// CLI binary
const version = execFileSync("node", ["lib/cjs/cli.js", "--version"], { encoding: "utf8" }).trim();
assert.match(version, /^\d+\.\d+\.\d+/, "CLI --version should print a semver");

console.log(`smoke: CJS + ESM + CLI consumption OK (${process.version})`);
