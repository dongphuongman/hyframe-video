import "dotenv/config";

export type TtsProvider = "edge-tts" | "lucylab" | "elevenlabs" | "vbee" | "vieneu" | "vieneu-local";
export type VideoTheme = "dark-neon" | "light-pro";

export interface TiktokConfig {
  displayName: string;
  handle: string;
  followers: string;
  /** URL to download avatar JPG. If undefined, the bundled `assets/avatar.jpg` is used. */
  avatarUrl?: string;
  /** When false, hide the TikTok follow card (outro) + persistent handle. Default true. */
  branding: boolean;
}

export interface Config {
  ttsProvider: TtsProvider;

  // Edge TTS (Free, no API key required)
  edgeTtsVoice: string;
  edgeTtsRate: string;
  edgeTtsPitch: string;
  edgeTtsVolume: string;

  // LucyLab
  lucylabApiKey?: string;
  lucylabVoiceId?: string;
  lucylabEndpoint: string;
  lucylabPollIntervalMs: number;
  lucylabPollTimeoutMs: number;

  // ElevenLabs
  elevenlabsApiKey?: string;
  elevenlabsVoiceId?: string;
  elevenlabsModelId: string;
  elevenlabsEndpoint: string;

  // Vbee
  vbeeAppId?: string;
  vbeeAccessToken?: string;
  vbeeEndpoint: string;
  vbeeVoiceCode: string;
  vbeeSpeedRate: number;
  vbeePollIntervalMs: number;
  vbeePollTimeoutMs: number;

  // VieNeu
  vieneuApiKey?: string;
  vieneuVoiceId: string;
  vieneuModelId: string;
  vieneuEndpoint: string;

  // VieNeu local (on-device SDK, no API key)
  vieneuLocalVoice: string;
  vieneuLocalPython: string;
  vieneuLocalMode?: string;
  vieneuLocalPrecision?: string;
  vieneuLocalTimeoutMs: number;

  // TikTok follow card (outro)
  tiktok: TiktokConfig;

  ttsConcurrency: number;

  /** Visual template — selects which styles.<theme>.css file gets used. */
  videoTheme: VideoTheme;

  // ── Render tuning ─────────────────────────────────────────────────────────
  /** hyperframes quality: "draft" (fast preview) | "standard" | "high". Default "standard". */
  renderQuality: "draft" | "standard" | "high";
  /** Output fps: 24 | 30 | 60. Default 30. Lower fps = faster render, smaller file. */
  videoFps: number;
  /** Parallel render workers (number) or 0 = auto. Default 0 (auto). */
  renderWorkers: number;
  /** Encoder CRF passed to hyperframes (lower = bigger/better). Default: unset (hyperframes default). */
  videoCrf?: number;
  /** When true, ffmpeg-transcode video.mp4 → video.tiktok.mp4 (crf 28, yuv420p, faststart). Default true. */
  tiktokCompress: boolean;
  /** CRF for the TikTok compressed copy. Default 28 (~5-8MB for 30s). */
  tiktokCrf: number;
}

function intDefault(name: string, def: number): number {
  const v = process.env[name];
  if (!v) return def;
  const n = parseInt(v, 10);
  if (isNaN(n)) throw new Error(`Env var ${name} must be integer, got "${v}"`);
  return n;
}

function floatDefault(name: string, def: number): number {
  const v = process.env[name];
  if (!v) return def;
  const n = parseFloat(v);
  if (isNaN(n)) throw new Error(`Env var ${name} must be a number, got "${v}"`);
  return n;
}

function boolDefault(name: string, def: boolean): boolean {
  const v = process.env[name];
  if (v === undefined || v.trim() === "") return def;
  const s = v.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(s)) return true;
  if (["0", "false", "no", "off"].includes(s)) return false;
  throw new Error(`Env var ${name} must be boolean (true/false), got "${v}"`);
}

export function loadConfig(): Config {
  const rawProvider = (process.env.TTS_PROVIDER ?? "edge-tts").trim().toLowerCase();
  const provider = (rawProvider === "edgetts" ? "edge-tts" : rawProvider) as TtsProvider;

  if (
    provider !== "edge-tts" &&
    provider !== "lucylab" &&
    provider !== "elevenlabs" &&
    provider !== "vbee" &&
    provider !== "vieneu" &&
    provider !== "vieneu-local"
  ) {
    throw new Error(
      `TTS_PROVIDER must be "edge-tts", "lucylab", "elevenlabs", "vbee", "vieneu" or "vieneu-local", got "${rawProvider}"`
    );
  }

  // Validate provider-specific required vars
  if (provider === "lucylab") {
    if (!process.env.VIETNAMESE_API_KEY || process.env.VIETNAMESE_API_KEY.trim() === "") {
      throw new Error(
        `Missing VIETNAMESE_API_KEY (required when TTS_PROVIDER=lucylab). ` +
        `Copy .env.example to .env.local and fill in your LucyLab API key.`
      );
    }
    if (!process.env.VIETNAMESE_VOICEID || process.env.VIETNAMESE_VOICEID.trim() === "") {
      throw new Error(
        `Missing VIETNAMESE_VOICEID (required when TTS_PROVIDER=lucylab). ` +
        `Copy .env.example to .env.local and fill in your LucyLab voice ID.`
      );
    }
  } else if (provider === "elevenlabs") {
    if (!process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY.trim() === "") {
      throw new Error(
        `Missing ELEVENLABS_API_KEY (required when TTS_PROVIDER=elevenlabs). ` +
        `Copy .env.example to .env.local and fill in your ElevenLabs API key.`
      );
    }
    if (!process.env.ELEVENLABS_VOICE_ID || process.env.ELEVENLABS_VOICE_ID.trim() === "") {
      throw new Error(
        `Missing ELEVENLABS_VOICE_ID (required when TTS_PROVIDER=elevenlabs). ` +
        `Copy .env.example to .env.local and fill in your ElevenLabs voice ID.`
      );
    }
  } else if (provider === "vbee") {
    if (!process.env.VBEE_APP_ID || process.env.VBEE_APP_ID.trim() === "") {
      throw new Error(
        `Missing VBEE_APP_ID (required when TTS_PROVIDER=vbee). ` +
        `Copy .env.example to .env.local and fill in your Vbee app ID.`
      );
    }
    if (!process.env.VBEE_ACCESS_TOKEN || process.env.VBEE_ACCESS_TOKEN.trim() === "") {
      throw new Error(
        `Missing VBEE_ACCESS_TOKEN (required when TTS_PROVIDER=vbee). ` +
        `Copy .env.example to .env.local and fill in your Vbee access token.`
      );
    }
  } else if (provider === "vieneu") {
    if (!process.env.VIENEU_API_KEY || process.env.VIENEU_API_KEY.trim() === "") {
      throw new Error(
        `Missing VIENEU_API_KEY (required when TTS_PROVIDER=vieneu). ` +
        `Get one at https://www.vieneu.io/#/developer, then copy .env.example to .env.local.`
      );
    }
  }

  const videoTheme = (process.env.VIDEO_THEME ?? "dark-neon") as VideoTheme;
  if (videoTheme !== "dark-neon" && videoTheme !== "light-pro") {
    throw new Error(`VIDEO_THEME must be "dark-neon" or "light-pro", got "${videoTheme}"`);
  }

  const renderQuality = (process.env.RENDER_QUALITY ?? "standard") as Config["renderQuality"];
  if (renderQuality !== "draft" && renderQuality !== "standard" && renderQuality !== "high") {
    throw new Error(`RENDER_QUALITY must be "draft", "standard" or "high", got "${renderQuality}"`);
  }

  const videoFps = intDefault("VIDEO_FPS", 30);
  if (![24, 30, 60].includes(videoFps)) {
    throw new Error(`VIDEO_FPS must be 24, 30 or 60, got "${videoFps}"`);
  }

  const videoCrfRaw = process.env.VIDEO_CRF?.trim();
  let videoCrf: number | undefined;
  if (videoCrfRaw) {
    videoCrf = parseInt(videoCrfRaw, 10);
    if (isNaN(videoCrf) || videoCrf < 0 || videoCrf > 51) {
      throw new Error(`VIDEO_CRF must be an integer 0-51, got "${videoCrfRaw}"`);
    }
  }

  return {
    ttsProvider: provider,
    edgeTtsVoice: process.env.EDGE_TTS_VOICE ?? "vi-VN-HoaiMyNeural",
    edgeTtsRate: process.env.EDGE_TTS_RATE ?? "+0%",
    edgeTtsPitch: process.env.EDGE_TTS_PITCH ?? "+0Hz",
    edgeTtsVolume: process.env.EDGE_TTS_VOLUME ?? "+0%",
    lucylabApiKey: process.env.VIETNAMESE_API_KEY,
    lucylabVoiceId: process.env.VIETNAMESE_VOICEID,
    lucylabEndpoint: process.env.LUCYLAB_ENDPOINT ?? "https://api.lucylab.io/json-rpc",
    lucylabPollIntervalMs: intDefault("LUCYLAB_POLL_INTERVAL_MS", 2000),
    lucylabPollTimeoutMs: intDefault("LUCYLAB_POLL_TIMEOUT_MS", 120000),
    elevenlabsApiKey: process.env.ELEVENLABS_API_KEY,
    elevenlabsVoiceId: process.env.ELEVENLABS_VOICE_ID,
    elevenlabsModelId: process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2",
    elevenlabsEndpoint: process.env.ELEVENLABS_ENDPOINT ?? "https://api.elevenlabs.io/v1",
    vbeeAppId: process.env.VBEE_APP_ID,
    vbeeAccessToken: process.env.VBEE_ACCESS_TOKEN,
    vbeeEndpoint: process.env.VBEE_ENDPOINT ?? "https://vbee.vn/api/v1",
    vbeeVoiceCode: process.env.VBEE_VOICE_CODE ?? "n_hanoi_male_protrainer_education_vc",
    vbeeSpeedRate: floatDefault("VBEE_SPEED_RATE", 1.0),
    vbeePollIntervalMs: intDefault("VBEE_POLL_INTERVAL_MS", 2000),
    vbeePollTimeoutMs: intDefault("VBEE_POLL_TIMEOUT_MS", 60000),
    vieneuApiKey: process.env.VIENEU_API_KEY,
    vieneuVoiceId: process.env.VIENEU_VOICE ?? "Ngọc Lan",
    vieneuModelId: process.env.VIENEU_MODEL ?? "vieneu-v4",
    vieneuEndpoint: process.env.VIENEU_ENDPOINT ?? "https://api.vieneu.io/api/v1",
    vieneuLocalVoice: process.env.VIENEU_LOCAL_VOICE ?? "Minh Quân Pro",
    vieneuLocalPython: process.env.VIENEU_LOCAL_PYTHON ?? "python3",
    vieneuLocalMode: process.env.VIENEU_LOCAL_MODE || undefined,
    vieneuLocalPrecision: process.env.VIENEU_LOCAL_PRECISION || undefined,
    vieneuLocalTimeoutMs: intDefault("VIENEU_LOCAL_TIMEOUT_MS", 300000),
    tiktok: {
      displayName: process.env.TIKTOK_DISPLAY_NAME ?? "Tin Tức 24h",
      handle: process.env.TIKTOK_HANDLE ?? "@tintuc24h",
      followers: process.env.TIKTOK_FOLLOWERS ?? "1.2M followers",
      avatarUrl: process.env.TIKTOK_AVATAR_URL || undefined,
      branding: boolDefault("TIKTOK_BRANDING", true),
    },
    ttsConcurrency: intDefault("TTS_CONCURRENCY", 1),
    videoTheme,
    renderQuality,
    videoFps,
    renderWorkers: intDefault("RENDER_WORKERS", 0),
    videoCrf,
    tiktokCompress: boolDefault("TIKTOK_COMPRESS", true),
    tiktokCrf: intDefault("TIKTOK_CRF", 28),
  };
}
