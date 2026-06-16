// Writes a per-directory package.json into each build output folder so Node
// interprets the files with the correct module system regardless of the root
// package.json "type". This makes the dual ESM/CJS package resolve correctly
// and silences the MODULE_TYPELESS_PACKAGE_JSON warning.
import { writeFileSync } from "fs";

writeFileSync("lib/cjs/package.json", JSON.stringify({ type: "commonjs" }, null, 2) + "\n");
writeFileSync("lib/esm/package.json", JSON.stringify({ type: "module" }, null, 2) + "\n");

console.log("postbuild: wrote lib/cjs/package.json (commonjs) and lib/esm/package.json (module)");
