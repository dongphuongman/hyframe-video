import axios from "axios";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export interface FetchResult {
  success: boolean;
  /** Actual saved path — extension is corrected from the image content-type
   *  (e.g. asking for "bg.jpg" may yield "bg.png"). */
  path?: string;
  reason?: string;
}

/** Map HTTP content-type → file extension. Falls back to sniffing magic bytes. */
function extFromContentType(ct: string, data: Buffer): string {
  const c = ct.toLowerCase();
  if (c.includes("png")) return ".png";
  if (c.includes("webp")) return ".webp";
  if (c.includes("gif")) return ".gif";
  if (c.includes("jpeg") || c.includes("jpg")) return ".jpg";
  // Sniff magic bytes (servers sometimes lie about content-type)
  if (data[0] === 0x89 && data[1] === 0x50) return ".png";
  if (data[0] === 0x47 && data[1] === 0x49) return ".gif";
  if (data[0] === 0x52 && data[1] === 0x49) return ".webp";
  if (data[0] === 0xff && data[1] === 0xd8) return ".jpg";
  return ".jpg";
}

const KNOWN_IMG_EXT = /\.(jpe?g|png|webp|gif)$/i;

export async function fetchImage(url: string | null, outPath: string): Promise<FetchResult> {
  if (!url) return { success: false, reason: "no url provided (null)" };

  try {
    const resp = await axios.get<ArrayBuffer>(url, {
      responseType: "arraybuffer",
      timeout: 30000,
      validateStatus: (s) => s < 400,
    });

    const ct = String(resp.headers["content-type"] ?? "");
    if (!ct.startsWith("image/")) {
      return { success: false, reason: `non-image content-type: ${ct}` };
    }

    const data = Buffer.from(resp.data);
    // Correct the extension: a PNG served as "bg.jpg" breaks strict servers
    // and confuses players. "bg.jpg" request may become "bg.png" on disk.
    const realPath = outPath.replace(KNOWN_IMG_EXT, "") + extFromContentType(ct, data);

    await mkdir(dirname(realPath), { recursive: true });
    await writeFile(realPath, data);
    return { success: true, path: realPath };
  } catch (e: any) {
    const status = e.response?.status;
    return { success: false, reason: status ? `http ${status}` : String(e.message ?? e) };
  }
}
