import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { getDurationSec } from "../assets/audio-tools.js";
import { VieNeuLocalClient } from "./vieneu-local-client.js";

let tmpDir: string;
let stubBin: string;

/** Fake "python" that copies a fixture mp3 to the --out path (skips real synthesis). */
function writeStub(mode: "ok" | "no-module" | "fail"): void {
  const fixture = join(process.cwd(), "tests/fixtures/sample-audio-1.mp3");
  const body =
    mode === "ok"
      ? `out=""; prev=""; for a in "$@"; do if [ "$prev" = "--out" ]; then out="$a"; fi; prev="$a"; done\ncp "${fixture}" "$out"\n`
      : mode === "no-module"
        ? `echo "ERROR: No module named vieneu. Install with: pip install vieneu" >&2\nexit 2\n`
        : `echo "boom" >&2\nexit 1\n`;
  writeFileSync(stubBin, `#!/bin/sh\n${body}`);
  chmodSync(stubBin, 0o755);
}

const baseOpts = {
  voice: "Minh Quân Pro",
  pythonBin: "", // set per-test
  timeoutMs: 30000,
};

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), "vnl-test-"));
  stubBin = join(tmpDir, "fake-python");
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("VieNeuLocalClient", () => {
  it("runs bridge + converts to mp3", async () => {
    writeStub("ok");
    const client = new VieNeuLocalClient({ ...baseOpts, pythonBin: stubBin });
    const out = join(tmpDir, "out.mp3");
    await client.generate("Xin chào", out);
    expect(existsSync(out)).toBe(true);
    const d = await getDurationSec(out);
    expect(d).toBeGreaterThan(1.5);
  });

  it("passes --voice/--mode through to the bridge", async () => {
    writeFileSync(
      stubBin,
      `#!/bin/sh\necho "$@" > "${join(tmpDir, "args.txt")}"\nout=""; prev=""; for a in "$@"; do if [ "$prev" = "--out" ]; then out="$a"; fi; prev="$a"; done\ncp "${join(process.cwd(), "tests/fixtures/sample-audio-1.mp3")}" "$out"\n`,
    );
    chmodSync(stubBin, 0o755);
    const client = new VieNeuLocalClient({
      ...baseOpts,
      pythonBin: stubBin,
      mode: "v3nano",
      precision: "int8",
    });
    await client.generate("hi", join(tmpDir, "out.mp3"));
    const argv = readFileSync(join(tmpDir, "args.txt"), "utf8");
    expect(argv).toContain("--voice Minh Quân Pro");
    expect(argv).toContain("--mode v3nano");
    expect(argv).toContain("--precision int8");
  });

  it("throws helpful error when python binary missing", async () => {
    const client = new VieNeuLocalClient({ ...baseOpts, pythonBin: "/nonexistent/python3" });
    await expect(client.generate("hi", join(tmpDir, "out.mp3")))
      .rejects.toThrow(/VIENEU_LOCAL_PYTHON/);
  });

  it("throws install hint when vieneu package missing", async () => {
    writeStub("no-module");
    const client = new VieNeuLocalClient({ ...baseOpts, pythonBin: stubBin });
    await expect(client.generate("hi", join(tmpDir, "out.mp3")))
      .rejects.toThrow(/pip install vieneu/);
  });

  it("throws bridge stderr on generic failure", async () => {
    writeStub("fail");
    const client = new VieNeuLocalClient({ ...baseOpts, pythonBin: stubBin });
    await expect(client.generate("hi", join(tmpDir, "out.mp3")))
      .rejects.toThrow(/exit 1/);
  });

  it("ignores srtOutPath silently", async () => {
    writeStub("ok");
    const client = new VieNeuLocalClient({ ...baseOpts, pythonBin: stubBin });
    const out = join(tmpDir, "out.mp3");
    const srt = join(tmpDir, "out.srt");
    await client.generate("hi", out, srt);
    expect(existsSync(out)).toBe(true);
    expect(existsSync(srt)).toBe(false);
  });
});
