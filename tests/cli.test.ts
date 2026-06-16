import { describe, expect, test } from "bun:test";
import { resolve } from "path";

// Exercises the built CLI binary. Requires `bun run build` first
// (CI runs the build step before tests).
const CLI = resolve(__dirname, "../lib/cjs/cli.js");

async function runCli(args: string[], stdin?: string) {
    const proc = Bun.spawn(["node", CLI, ...args], {
        stdin: stdin ? new TextEncoder().encode(stdin) : "ignore",
        stdout: "pipe",
        stderr: "pipe",
    });
    const [stdout, stderr] = await Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
    ]);
    const exitCode = await proc.exited;
    return { stdout, stderr, exitCode };
}

describe("cli", () => {
    test("converts CSV from stdin with custom column names", async () => {
        const { stdout, exitCode } = await runCli(
            ["--latitude", "lat", "--longitude", "lon"],
            "lat,lon,name\n37.1,127.2,test",
        );

        expect(exitCode).toBe(0);
        const geojson = JSON.parse(stdout);
        expect(geojson.type).toBe("FeatureCollection");
        expect(geojson.features[0].geometry.coordinates).toEqual([127.2, 37.1]);
        expect(geojson.features[0].properties.name).toBe("test");
    });

    test("prints version", async () => {
        const { stdout, exitCode } = await runCli(["--version"]);
        expect(exitCode).toBe(0);
        expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+/);
    });

    test("exits non-zero on unknown option", async () => {
        const { stderr, exitCode } = await runCli(["--nope"]);
        expect(exitCode).toBe(2);
        expect(stderr).toContain("Unknown option: --nope");
    });

    test("exits non-zero on invalid coordinate data", async () => {
        const { stderr, exitCode } = await runCli([], "Latitude,Longitude\n99,127.2");
        expect(exitCode).toBe(1);
        expect(stderr).toContain("Out-of-range latitude");
    });

    test("rejects an option with a missing value", async () => {
        const { stderr, exitCode } = await runCli(["--latitude"], "Latitude,Longitude\n37.1,127.2");
        expect(exitCode).toBe(2);
        expect(stderr).toContain("Missing value for --latitude");
    });

    test("rejects -o immediately followed by another flag", async () => {
        const { stderr, exitCode } = await runCli(["-o", "--pretty"], "Latitude,Longitude\n37.1,127.2");
        expect(exitCode).toBe(2);
        expect(stderr).toContain("Missing value for -o");
    });
});
