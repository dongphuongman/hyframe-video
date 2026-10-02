import { spawn } from "node:child_process";
import { stat } from "node:fs/promises";

function run(cmd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args);
    let out = "", err = "";
    proc.stdout.on("data", (d) => (out += d.toString()));
    proc.stderr.on("data", (d) => (err += d.toString()));
    proc.on("close", (code) => {
      if (code === 0) resolve(out);
      else reject(new Error(`${cmd} failed (exit ${code}): ${err}`));
    });
    proc.on("error", reject);
  });
}

export interface CompressResult {
  outPath: string;
  rawBytes: number;
  outBytes: number;
  ratio: number;
}

/**
 * Transcode a rendered video into a TikTok-upload-ready copy.
 *
 * - `-crf 28` → ~5-8MB for 30s 1080x1920 (vs ~98MB raw at ~26Mbps)
 * - `yuv420p` → max player compatibility (TikTok re-encode safe)
 * - `+faststart` → moov atom first, instant preview on upload
 * - audio 128k AAC → TikTok re-encodes audio anyway, no need for 192k
 */
export async function compressForTiktok(
  inPath: string,
  outPath: string,
  crf = 28,
): Promise<CompressResult> {
  await run("ffmpeg", [
    "-y", "-i", inPath,
    "-c:v", "libx264",
    "-crf", String(crf),
    "-preset", "veryfast",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "128k",
    "-movflags", "+faststart",
    outPath,
  ]);
  const [raw, out] = await Promise.all([stat(inPath), stat(outPath)]);
  return { outPath, rawBytes: raw.size, outBytes: out.size, ratio: out.size / raw.size };
}

export function formatMB(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}
