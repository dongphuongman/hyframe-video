import { describe, it, expect, beforeEach, afterEach } from "vitest";
import nock from "nock";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { VieNeuClient } from "./vieneu-client.js";

const opts = {
  apiKey: "vn_sk_test",
  voiceId: "Ngọc Lan",
  modelId: "vieneu-v4",
  endpoint: "https://api.vieneu.io/api/v1",
};

let tmpDir: string;

beforeEach(() => {
  nock.cleanAll();
  tmpDir = mkdtempSync(join(tmpdir(), "vn-test-"));
});

afterEach(() => {
  nock.cleanAll();
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("VieNeuClient", () => {
  it("posts input and writes mp3 response to disk", async () => {
    nock("https://api.vieneu.io")
      .post(
        "/api/v1/audio/speech",
        (b: any) => b.input === "Xin chào" && b.voice === opts.voiceId && b.model === opts.modelId
      )
      .matchHeader("Authorization", `Bearer ${opts.apiKey}`)
      .reply(200, Buffer.from("MP3DATA"), { "content-type": "audio/mpeg" });

    const client = new VieNeuClient(opts);
    const out = join(tmpDir, "out.mp3");
    await client.generate("Xin chào", out);
    expect(readFileSync(out).toString()).toBe("MP3DATA");
  });

  it("retries on 429 (rate limit) with backoff", async () => {
    nock("https://api.vieneu.io")
      .post("/api/v1/audio/speech").reply(429, { error: { message: "rate limited" } })
      .post("/api/v1/audio/speech").reply(200, Buffer.from("OK"), { "content-type": "audio/mpeg" });

    const client = new VieNeuClient(opts);
    const out = join(tmpDir, "out.mp3");
    await client.generate("hi", out);
    expect(readFileSync(out).toString()).toBe("OK");
  }, 15000);

  it("retries on 5xx with backoff", async () => {
    nock("https://api.vieneu.io")
      .post("/api/v1/audio/speech").reply(503, "Service Unavailable")
      .post("/api/v1/audio/speech").reply(200, Buffer.from("OK2"), { "content-type": "audio/mpeg" });

    const client = new VieNeuClient(opts);
    const out = join(tmpDir, "out.mp3");
    await client.generate("hi", out);
    expect(readFileSync(out).toString()).toBe("OK2");
  }, 15000);

  it("throws with API error detail on 4xx (not 429)", async () => {
    nock("https://api.vieneu.io")
      .post("/api/v1/audio/speech")
      .reply(401, { error: { message: "Invalid API key", type: "authentication_error" } });

    const client = new VieNeuClient(opts);
    await expect(client.generate("hi", join(tmpDir, "out.mp3")))
      .rejects.toThrow(/Invalid API key|401/);
  });

  it("throws helpful message on 403 insufficient_quota", async () => {
    nock("https://api.vieneu.io")
      .post("/api/v1/audio/speech")
      .reply(403, { error: { message: "token grant exhausted", type: "insufficient_quota" } });

    const client = new VieNeuClient(opts);
    await expect(client.generate("hi", join(tmpDir, "out.mp3")))
      .rejects.toThrow(/token grant exhausted/);
  });

  it("ignores srtOutPath silently (VieNeu has no SRT)", async () => {
    nock("https://api.vieneu.io")
      .post("/api/v1/audio/speech")
      .reply(200, Buffer.from("MP3"), { "content-type": "audio/mpeg" });

    const client = new VieNeuClient(opts);
    const out = join(tmpDir, "out.mp3");
    const srt = join(tmpDir, "out.srt");
    await client.generate("hi", out, srt);
    // mp3 written, srt NOT written (no error)
    expect(readFileSync(out).toString()).toBe("MP3");
    expect(() => readFileSync(srt)).toThrow();
  });
});
