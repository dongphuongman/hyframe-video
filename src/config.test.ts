import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadConfig } from "./config.js";

const ENV_KEYS = [
  "TTS_PROVIDER",
  "EDGE_TTS_VOICE",
  "EDGE_TTS_RATE",
  "EDGE_TTS_PITCH",
  "EDGE_TTS_VOLUME",
  "VIETNAMESE_API_KEY",
  "VIETNAMESE_VOICEID",
  "LUCYLAB_ENDPOINT",
  "LUCYLAB_POLL_INTERVAL_MS",
  "LUCYLAB_POLL_TIMEOUT_MS",
  "ELEVENLABS_API_KEY",
  "ELEVENLABS_VOICE_ID",
  "ELEVENLABS_MODEL_ID",
  "ELEVENLABS_ENDPOINT",
  "VBEE_APP_ID",
  "VBEE_ACCESS_TOKEN",
  "VBEE_ENDPOINT",
  "VBEE_VOICE_CODE",
  "VBEE_SPEED_RATE",
  "VBEE_POLL_INTERVAL_MS",
  "VBEE_POLL_TIMEOUT_MS",
  "VIENEU_API_KEY",
  "VIENEU_VOICE",
  "VIENEU_MODEL",
  "VIENEU_ENDPOINT",
  "VIENEU_LOCAL_VOICE",
  "VIENEU_LOCAL_PYTHON",
  "VIENEU_LOCAL_MODE",
  "VIENEU_LOCAL_PRECISION",
  "VIENEU_LOCAL_TIMEOUT_MS",
  "TTS_CONCURRENCY",
  "TIKTOK_DISPLAY_NAME",
  "TIKTOK_HANDLE",
  "TIKTOK_FOLLOWERS",
  "TIKTOK_AVATAR_URL",
  "TIKTOK_BRANDING",
  "VIDEO_THEME",
  "RENDER_QUALITY",
  "VIDEO_FPS",
  "RENDER_WORKERS",
  "VIDEO_CRF",
  "TIKTOK_COMPRESS",
  "TIKTOK_CRF",
];

describe("loadConfig", () => {
  let saved: Record<string, string | undefined>;

  beforeEach(() => {
    saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
    ENV_KEYS.forEach((k) => delete process.env[k]);
  });

  afterEach(() => {
    Object.entries(saved).forEach(([k, v]) => {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    });
  });

  describe("Edge TTS provider (default)", () => {
    it("reads Edge TTS defaults when no provider specified", () => {
      const cfg = loadConfig();
      expect(cfg.ttsProvider).toBe("edge-tts");
      expect(cfg.edgeTtsVoice).toBe("vi-VN-HoaiMyNeural");
      expect(cfg.edgeTtsRate).toBe("+0%");
      expect(cfg.edgeTtsPitch).toBe("+0Hz");
      expect(cfg.edgeTtsVolume).toBe("+0%");
      expect(cfg.ttsConcurrency).toBe(1);
    });

    it("respects EDGE_TTS overrides", () => {
      process.env.TTS_PROVIDER = "edge-tts";
      process.env.EDGE_TTS_VOICE = "vi-VN-NamMinhNeural";
      process.env.EDGE_TTS_RATE = "+10%";
      process.env.EDGE_TTS_PITCH = "+5Hz";
      process.env.EDGE_TTS_VOLUME = "-10%";
      const cfg = loadConfig();
      expect(cfg.ttsProvider).toBe("edge-tts");
      expect(cfg.edgeTtsVoice).toBe("vi-VN-NamMinhNeural");
      expect(cfg.edgeTtsRate).toBe("+10%");
      expect(cfg.edgeTtsPitch).toBe("+5Hz");
      expect(cfg.edgeTtsVolume).toBe("-10%");
    });

    it("accepts 'edgetts' as alias for 'edge-tts'", () => {
      process.env.TTS_PROVIDER = "edgetts";
      const cfg = loadConfig();
      expect(cfg.ttsProvider).toBe("edge-tts");
    });
  });

  describe("LucyLab provider", () => {
    it("reads LucyLab env vars when TTS_PROVIDER=lucylab", () => {
      process.env.TTS_PROVIDER = "lucylab";
      process.env.VIETNAMESE_API_KEY = "sk_test_abc";
      process.env.VIETNAMESE_VOICEID = "voice123";
      const cfg = loadConfig();
      expect(cfg.ttsProvider).toBe("lucylab");
      expect(cfg.lucylabApiKey).toBe("sk_test_abc");
      expect(cfg.lucylabVoiceId).toBe("voice123");
    });

    it("throws when VIETNAMESE_API_KEY missing", () => {
      process.env.TTS_PROVIDER = "lucylab";
      process.env.VIETNAMESE_VOICEID = "voice123";
      expect(() => loadConfig()).toThrow(/VIETNAMESE_API_KEY/);
    });

    it("uses sensible defaults for optional vars", () => {
      process.env.TTS_PROVIDER = "lucylab";
      process.env.VIETNAMESE_API_KEY = "k";
      process.env.VIETNAMESE_VOICEID = "v";
      const cfg = loadConfig();
      expect(cfg.lucylabEndpoint).toBe("https://api.lucylab.io/json-rpc");
      expect(cfg.lucylabPollIntervalMs).toBe(2000);
      expect(cfg.lucylabPollTimeoutMs).toBe(120000);
      expect(cfg.ttsConcurrency).toBe(1);
    });
  });

  describe("ElevenLabs provider", () => {
    it("reads ElevenLabs env vars when TTS_PROVIDER=elevenlabs", () => {
      process.env.TTS_PROVIDER = "elevenlabs";
      process.env.ELEVENLABS_API_KEY = "sk_eleven_xyz";
      process.env.ELEVENLABS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
      const cfg = loadConfig();
      expect(cfg.ttsProvider).toBe("elevenlabs");
      expect(cfg.elevenlabsApiKey).toBe("sk_eleven_xyz");
      expect(cfg.elevenlabsVoiceId).toBe("EXAVITQu4vr4xnSDxMaL");
      expect(cfg.elevenlabsModelId).toBe("eleven_multilingual_v2");
      expect(cfg.elevenlabsEndpoint).toBe("https://api.elevenlabs.io/v1");
    });

    it("throws when ELEVENLABS_API_KEY missing", () => {
      process.env.TTS_PROVIDER = "elevenlabs";
      process.env.ELEVENLABS_VOICE_ID = "v";
      expect(() => loadConfig()).toThrow(/ELEVENLABS_API_KEY/);
    });

    it("respects ELEVENLABS_MODEL_ID override", () => {
      process.env.TTS_PROVIDER = "elevenlabs";
      process.env.ELEVENLABS_API_KEY = "k";
      process.env.ELEVENLABS_VOICE_ID = "v";
      process.env.ELEVENLABS_MODEL_ID = "eleven_turbo_v2_5";
      const cfg = loadConfig();
      expect(cfg.elevenlabsModelId).toBe("eleven_turbo_v2_5");
    });
  });

  describe("Vbee provider", () => {
    it("reads Vbee env vars when TTS_PROVIDER=vbee", () => {
      process.env.TTS_PROVIDER = "vbee";
      process.env.VBEE_APP_ID = "app-1";
      process.env.VBEE_ACCESS_TOKEN = "token-abc";
      const cfg = loadConfig();
      expect(cfg.ttsProvider).toBe("vbee");
      expect(cfg.vbeeAppId).toBe("app-1");
      expect(cfg.vbeeAccessToken).toBe("token-abc");
      expect(cfg.vbeeEndpoint).toBe("https://vbee.vn/api/v1");
      expect(cfg.vbeeVoiceCode).toBe("n_hanoi_male_protrainer_education_vc");
      expect(cfg.vbeeSpeedRate).toBe(1.0);
      expect(cfg.vbeePollIntervalMs).toBe(2000);
      expect(cfg.vbeePollTimeoutMs).toBe(60000);
    });

    it("throws when VBEE_APP_ID missing", () => {
      process.env.TTS_PROVIDER = "vbee";
      process.env.VBEE_ACCESS_TOKEN = "token-abc";
      expect(() => loadConfig()).toThrow(/VBEE_APP_ID/);
    });

    it("throws when VBEE_ACCESS_TOKEN missing", () => {
      process.env.TTS_PROVIDER = "vbee";
      process.env.VBEE_APP_ID = "app-1";
      expect(() => loadConfig()).toThrow(/VBEE_ACCESS_TOKEN/);
    });

    it("respects VBEE_VOICE_CODE and VBEE_SPEED_RATE overrides", () => {
      process.env.TTS_PROVIDER = "vbee";
      process.env.VBEE_APP_ID = "app-1";
      process.env.VBEE_ACCESS_TOKEN = "token-abc";
      process.env.VBEE_VOICE_CODE = "n_hanoi_female_nguyetnga2_book_vc";
      process.env.VBEE_SPEED_RATE = "1.2";
      const cfg = loadConfig();
      expect(cfg.vbeeVoiceCode).toBe("n_hanoi_female_nguyetnga2_book_vc");
      expect(cfg.vbeeSpeedRate).toBe(1.2);
    });
  });

  it("rejects invalid TTS_PROVIDER", () => {    process.env.TTS_PROVIDER = "google";
    process.env.VIETNAMESE_API_KEY = "k";
    process.env.VIETNAMESE_VOICEID = "v";
    expect(() => loadConfig()).toThrow(/TTS_PROVIDER/);
  });

  describe("TikTok branding", () => {
    it("uses neutral defaults when no TIKTOK_* vars set", () => {
      const cfg = loadConfig();
      expect(cfg.tiktok.displayName).toBe("Tin Tức 24h");
      expect(cfg.tiktok.handle).toBe("@tintuc24h");
      expect(cfg.tiktok.branding).toBe(true);
    });

    it("respects TIKTOK_* overrides", () => {
      process.env.TIKTOK_DISPLAY_NAME = "My Channel";
      process.env.TIKTOK_HANDLE = "@mybrand";
      process.env.TIKTOK_FOLLOWERS = "10k followers";
      const cfg = loadConfig();
      expect(cfg.tiktok.displayName).toBe("My Channel");
      expect(cfg.tiktok.handle).toBe("@mybrand");
      expect(cfg.tiktok.followers).toBe("10k followers");
    });

    it("TIKTOK_BRANDING=false disables branding", () => {
      process.env.TIKTOK_BRANDING = "false";
      expect(loadConfig().tiktok.branding).toBe(false);
    });

    it("rejects invalid TIKTOK_BRANDING", () => {
      process.env.TIKTOK_BRANDING = "maybe";
      expect(() => loadConfig()).toThrow(/TIKTOK_BRANDING/);
    });
  });

  describe("VieNeu provider", () => {
    it("reads VieNeu env vars when TTS_PROVIDER=vieneu", () => {
      process.env.TTS_PROVIDER = "vieneu";
      process.env.VIENEU_API_KEY = "vn_sk_test";
      process.env.VIENEU_VOICE = "Đăng Quân";
      const cfg = loadConfig();
      expect(cfg.ttsProvider).toBe("vieneu");
      expect(cfg.vieneuApiKey).toBe("vn_sk_test");
      expect(cfg.vieneuVoiceId).toBe("Đăng Quân");
      expect(cfg.vieneuModelId).toBe("vieneu-v4");
      expect(cfg.vieneuEndpoint).toBe("https://api.vieneu.io/api/v1");
    });

    it("uses Ngọc Lan voice default when VIENEU_VOICE unset", () => {
      process.env.TTS_PROVIDER = "vieneu";
      process.env.VIENEU_API_KEY = "vn_sk_test";
      expect(loadConfig().vieneuVoiceId).toBe("Ngọc Lan");
    });

    it("throws when VIENEU_API_KEY missing", () => {
      process.env.TTS_PROVIDER = "vieneu";
      expect(() => loadConfig()).toThrow(/VIENEU_API_KEY/);
    });

    it("respects VIENEU_MODEL and VIENEU_ENDPOINT overrides", () => {
      process.env.TTS_PROVIDER = "vieneu";
      process.env.VIENEU_API_KEY = "k";
      process.env.VIENEU_MODEL = "tts-1";
      process.env.VIENEU_ENDPOINT = "https://custom.example/v1";
      const cfg = loadConfig();
      expect(cfg.vieneuModelId).toBe("tts-1");
      expect(cfg.vieneuEndpoint).toBe("https://custom.example/v1");
    });
  });

  describe("VieNeu local provider", () => {
    it("needs no API key and uses SDK defaults", () => {
      process.env.TTS_PROVIDER = "vieneu-local";
      const cfg = loadConfig();
      expect(cfg.ttsProvider).toBe("vieneu-local");
      expect(cfg.vieneuLocalVoice).toBe("Minh Quân Pro");
      expect(cfg.vieneuLocalPython).toBe("python3");
      expect(cfg.vieneuLocalMode).toBeUndefined();
      expect(cfg.vieneuLocalPrecision).toBeUndefined();
      expect(cfg.vieneuLocalTimeoutMs).toBe(300000);
    });

    it("respects VIENEU_LOCAL_* overrides", () => {
      process.env.TTS_PROVIDER = "vieneu-local";
      process.env.VIENEU_LOCAL_VOICE = "Mai Anh";
      process.env.VIENEU_LOCAL_MODE = "v3nano";
      process.env.VIENEU_LOCAL_TIMEOUT_MS = "600000";
      const cfg = loadConfig();
      expect(cfg.vieneuLocalVoice).toBe("Mai Anh");
      expect(cfg.vieneuLocalMode).toBe("v3nano");
      expect(cfg.vieneuLocalTimeoutMs).toBe(600000);
    });
  });

  describe("render tuning", () => {
    it("uses sensible render defaults", () => {
      const cfg = loadConfig();
      expect(cfg.renderQuality).toBe("standard");
      expect(cfg.videoFps).toBe(30);
      expect(cfg.renderWorkers).toBe(0);
      expect(cfg.videoCrf).toBeUndefined();
      expect(cfg.tiktokCompress).toBe(true);
      expect(cfg.tiktokCrf).toBe(28);
    });

    it("respects RENDER_QUALITY / VIDEO_FPS / VIDEO_CRF overrides", () => {
      process.env.RENDER_QUALITY = "draft";
      process.env.VIDEO_FPS = "24";
      process.env.VIDEO_CRF = "23";
      process.env.TIKTOK_CRF = "30";
      const cfg = loadConfig();
      expect(cfg.renderQuality).toBe("draft");
      expect(cfg.videoFps).toBe(24);
      expect(cfg.videoCrf).toBe(23);
      expect(cfg.tiktokCrf).toBe(30);
    });

    it("rejects invalid RENDER_QUALITY / VIDEO_FPS / VIDEO_CRF", () => {
      process.env.RENDER_QUALITY = "ultra";
      expect(() => loadConfig()).toThrow(/RENDER_QUALITY/);
      delete process.env.RENDER_QUALITY;
      process.env.VIDEO_FPS = "25";
      expect(() => loadConfig()).toThrow(/VIDEO_FPS/);
      delete process.env.VIDEO_FPS;
      process.env.VIDEO_CRF = "99";
      expect(() => loadConfig()).toThrow(/VIDEO_CRF/);
    });

    it("TIKTOK_COMPRESS=false disables compress", () => {
      process.env.TIKTOK_COMPRESS = "false";
      expect(loadConfig().tiktokCompress).toBe(false);
    });
  });
});
