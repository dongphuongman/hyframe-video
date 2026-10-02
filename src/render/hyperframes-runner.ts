import { spawn } from "node:child_process";
import { log } from "../utils/logger.js";

export interface RenderArgs {
  compositionDir: string;  // path to composition directory
  outputPath: string;      // path for .mp4
  fps?: number;            // default 30
  quality?: "draft" | "standard" | "high"; // default "standard"
  /** Encoder CRF override (lower = bigger/better). Passed as --crf. */
  crf?: number;
  /** Parallel render workers. 0/undefined = hyperframes auto. Passed as --workers. */
  workers?: number;
}

export async function renderWithHyperframes(args: RenderArgs): Promise<void> {
  const { compositionDir, outputPath, fps = 30, quality = "standard", crf, workers } = args;

  const spawnArgs = [
    "hyperframes",
    "render",
    compositionDir,
    "--output",
    outputPath,
    "--fps",
    String(fps),
    "--quality",
    quality,
  ];

  if (crf !== undefined) {
    spawnArgs.push("--crf", String(crf));
  }
  if (workers !== undefined && workers > 0) {
    spawnArgs.push("--workers", String(workers));
  }

  const startedAt = Date.now();

  await new Promise<void>((resolve, reject) => {
    const proc = spawn("npx", spawnArgs, {
      stdio: ["ignore", "inherit", "inherit"],
      shell: true,
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `hyperframes render failed with exit code ${code}`
          )
        );
      }
    });

    proc.on("error", (err) => {
      reject(err);
    });
  });

  log.info(`Rendered: ${outputPath} (${((Date.now() - startedAt) / 1000).toFixed(0)}s, fps=${fps}, quality=${quality})`);
}
