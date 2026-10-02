import axios, { AxiosError } from "axios";
import { writeFile } from "node:fs/promises";
import type { TtsClient } from "./tts-client.js";

export interface VieNeuOpts {
  apiKey: string;
  voiceId: string;      // e.g. "Ngọc Lan" — list via GET /api/v1/audio/voices?engine=v4
  modelId: string;      // engine id, e.g. "vieneu-v4" (default). "tts-1" etc. also accepted.
  endpoint: string;      // e.g. "https://api.vieneu.io/api/v1"
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * VieNeu Cloud API client (Vietnamese TTS with instant voice cloning).
 *
 * API reference: https://docs.vieneu.io/docs/cloud-api/openai-compatible
 *
 * Synchronous: POST text → returns mp3 binary directly. No polling needed.
 * Uses the OpenAI-compatible `POST /audio/speech` endpoint:
 *   { input, voice, model, response_format: "mp3" }
 * Auth: `Authorization: Bearer <key>`.
 *
 * Note: VieNeu does NOT return SRT subtitles in this endpoint.
 * `srtOutPath` arg is ignored silently.
 */
export class VieNeuClient implements TtsClient {
  constructor(private cfg: VieNeuOpts) {}

  async generate(text: string, audioOutPath: string, _srtOutPath?: string): Promise<void> {
    await this.synthesizeWithRetry(text, audioOutPath);
    // VieNeu has no SRT — silently skip srtOutPath.
  }

  private async synthesizeWithRetry(text: string, outPath: string): Promise<void> {
    const delays = [1000, 2000, 4000];
    let lastErr: unknown;

    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const url = `${this.cfg.endpoint}/audio/speech`;
        const resp = await axios.post<ArrayBuffer>(
          url,
          {
            input: text,
            voice: this.cfg.voiceId,
            model: this.cfg.modelId,
            response_format: "mp3",
          },
          {
            headers: {
              "Authorization": `Bearer ${this.cfg.apiKey}`,
              "Content-Type": "application/json",
              "Accept": "audio/mpeg",
            },
            responseType: "arraybuffer",
            timeout: 120000,
          },
        );
        await writeFile(outPath, Buffer.from(resp.data));
        return;
      } catch (e) {
        lastErr = e;
        const err = e as AxiosError;
        const status = err.response?.status;
        const retryable = status === undefined || status === 429 || status >= 500;
        if (!retryable || attempt === delays.length) {
          // Try to extract VieNeu error message (OpenAI-shaped envelope)
          let detail = err.message;
          if (err.response?.data) {
            try {
              const body = err.response.data instanceof ArrayBuffer
                ? Buffer.from(err.response.data).toString("utf8")
                : String(err.response.data);
              const parsed = JSON.parse(body);
              detail = parsed?.error?.message ?? detail;
            } catch { /* ignore parse errors */ }
          }
          throw new Error(`VieNeu TTS failed (status ${status ?? "?"}): ${detail}`);
        }
        await sleep(delays[attempt]);
      }
    }
    throw lastErr;
  }
}
