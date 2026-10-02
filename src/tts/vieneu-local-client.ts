import { spawn } from "node:child_process";
import { writeFile, rm, mkdtemp } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import type { TtsClient } from "./tts-client.js";

export interface VieNeuLocalOpts {
  /** Voice name (preset or enrolled via add_voice). Default "Minh Quân Pro". */
  voice: string;
  /** Python interpreter. Default "python3". */
  pythonBin: string;
  /** Absolute path to scripts/vieneu-local.py bridge. Defaults to repo script. */
  bridgeScript?: string;
  /** SDK mode, e.g. "v3nano" for weak CPUs. Empty = SDK default (v3 Turbo). */
  mode?: string;
  /** CPU precision, e.g. "int8" (needs VNNI). Empty = SDK default (fp32). */
  precision?: string;
  /** Max ms per scene (model load ~19s CPU on first scene). Default 300000. */
  timeoutMs: number;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
// src/tts/ -> repo root -> scripts/vieneu-local.py
const DEFAULT_BRIDGE = join(__dirname, "..", "..", "scripts", "vieneu-local.py");

function runBridge(
  pythonBin: string,
  args: string[],
  timeoutMs: number,
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const proc = spawn(pythonBin, args, { timeout: timeoutMs });
    let stdout = "", stderr = "";
    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    const timer = setTimeout(() => {
      proc.kill("SIGKILL");
      reject(new Error(
        `VieNeu local synthesis timed out after ${timeoutMs}ms. ` +
        `First scene pays model-download + load cost; raise VIENEU_LOCAL_TIMEOUT_MS if needed.`
      ));
    }, timeoutMs + 5000);
    proc.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code: code ?? 1, stdout, stderr });
    });
    proc.on("error", (err: NodeJS.ErrnoException) => {
      clearTimeout(timer);
      if (err.code === "ENOENT") {
        reject(new Error(
          `Python not found at "${pythonBin}". ` +
          `Install Python 3.10+ or set VIENEU_LOCAL_PYTHON to your interpreter path.`
        ));
      } else {
        reject(err);
      }
    });
  });
}

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args);
    let err = "";
    proc.stderr.on("data", (d) => (err += d.toString()));
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg failed (exit ${code}): ${err.slice(-500)}`));
    });
    proc.on("error", reject);
  });
}

/**
 * VieNeu on-device TTS client (local Python SDK, fully offline after setup).
 *
 * Flow per scene: text → tmp txt → `python3 scripts/vieneu-local.py` → wav
 * → ffmpeg → mp3 (192k, 44.1kHz mono, same as other providers).
 *
 * Setup (once):
 *   brew install espeak                              # macOS (phonemizer)
 *   pip install vieneu --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/metal/
 * Model weights auto-download from HuggingFace on first synthesis.
 * Docs: https://docs.vieneu.io/docs/getting-started/installation
 *
 * Note: VieNeu local does NOT produce SRT subtitles.
 * `srtOutPath` arg is ignored silently.
 */
export class VieNeuLocalClient implements TtsClient {
  constructor(private cfg: VieNeuLocalOpts) {}

  async generate(text: string, audioOutPath: string, _srtOutPath?: string): Promise<void> {
    const tmp = await mkdtemp(join(tmpdir(), "vieneu-local-"));
    try {
      const textFile = join(tmp, "input.txt");
      const wavFile = join(tmp, "out.wav");
      await writeFile(textFile, text, "utf8");

      const bridge = this.cfg.bridgeScript ?? DEFAULT_BRIDGE;
      const args = ["--text-file", textFile, "--out", wavFile, "--voice", this.cfg.voice];
      if (this.cfg.mode) args.push("--mode", this.cfg.mode);
      if (this.cfg.precision) args.push("--precision", this.cfg.precision);

      const r = await runBridge(this.cfg.pythonBin, [bridge, ...args], this.cfg.timeoutMs);
      if (r.code !== 0) {
        const tail = (r.stderr || r.stdout).trim().split("\n").slice(-5).join("\n");
        if (/No module named vieneu/.test(tail)) {
          throw new Error(
            `VieNeu local failed: Python package "vieneu" not installed for ${this.cfg.pythonBin}.\n` +
            `Install with: pip install vieneu  (macOS Metal: add --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/metal/)\n` +
            `Plus eSpeak NG: brew install espeak`
          );
        }
        if (/espeak|libespeak|phonem/.test(tail)) {
          throw new Error(
            `VieNeu local failed (eSpeak NG missing?). Install: brew install espeak (macOS) / sudo apt install espeak-ng (Linux)\n${tail}`
          );
        }
        throw new Error(`VieNeu local synthesis failed (exit ${r.code}):\n${tail}`);
      }

      // Normalize to mp3 like the other providers (192k mono 44.1kHz)
      await runFfmpeg([
        "-y", "-i", wavFile,
        "-ar", "44100", "-ac", "1",
        "-c:a", "libmp3lame", "-b:a", "192k",
        audioOutPath,
      ]);
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
    // No SRT — silently skip srtOutPath.
  }
}
