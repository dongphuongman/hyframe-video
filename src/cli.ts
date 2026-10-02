#!/usr/bin/env node
import { config } from "dotenv";
config({ path: ".env.local" });

import { runPipeline, type PipelineOptions } from "./pipeline.js";
import { log } from "./utils/logger.js";

function printUsage(): void {
  console.error(`Usage: npm run pipeline -- <path/to/script.json> [options]

Options:
  --handle @name          Override TIKTOK_HANDLE (your TikTok handle)
  --display-name "Name"   Override TIKTOK_DISPLAY_NAME
  --followers "10k ..."   Override TIKTOK_FOLLOWERS
  --no-branding           Hide TikTok follow card + handle (no branding in video)
  --draft                 Fast preview render (quality=draft, ~3x faster)
  --quality <q>           Render quality: draft | standard | high (default from RENDER_QUALITY)
  --fps <n>               Output fps: 24 | 30 | 60 (default from VIDEO_FPS)
  --no-compress           Skip video.tiktok.mp4 compress step
  --help                  Show this help
`);
}

function parseArgs(argv: string[]): { scriptPath: string; opts: PipelineOptions } {
  const rest = [...argv];
  const scriptPath = rest.shift();
  if (!scriptPath) {
    printUsage();
    process.exit(2);
  }
  const opts: PipelineOptions = {};
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "--help" || a === "-h") {
      printUsage();
      process.exit(0);
    } else if (a === "--handle") {
      opts.handle = rest[++i];
    } else if (a === "--display-name") {
      opts.displayName = rest[++i];
    } else if (a === "--followers") {
      opts.followers = rest[++i];
    } else if (a === "--no-branding") {
      opts.branding = false;
    } else if (a === "--draft") {
      opts.quality = "draft";
    } else if (a === "--quality") {
      const q = rest[++i];
      if (q !== "draft" && q !== "standard" && q !== "high") {
        console.error(`--quality must be draft, standard or high, got "${q}"`);
        process.exit(2);
      }
      opts.quality = q;
    } else if (a === "--fps") {
      const n = parseInt(rest[++i], 10);
      if (![24, 30, 60].includes(n)) {
        console.error(`--fps must be 24, 30 or 60, got "${rest[i]}"`);
        process.exit(2);
      }
      opts.fps = n;
    } else if (a === "--no-compress") {
      opts.compress = false;
    } else {
      console.error(`Unknown option: ${a}`);
      printUsage();
      process.exit(2);
    }
  }
  if (opts.handle !== undefined && !opts.handle.startsWith("@")) {
    console.error(`--handle should start with @, got "${opts.handle}"`);
    process.exit(2);
  }
  return { scriptPath, opts };
}

async function main() {
  const { scriptPath, opts } = parseArgs(process.argv.slice(2));
  try {
    await runPipeline(scriptPath, opts);
  } catch (e) {
    log.error("Pipeline failed", e);
    process.exit(1);
  }
}

main();
