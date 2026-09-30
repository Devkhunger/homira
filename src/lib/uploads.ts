import "server-only";
import { randomBytes } from "crypto";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "./uploads");
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB per image

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

function sniff(buf: Buffer): string | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (buf.subarray(0, 3).toString("ascii") === "GIF") return "image/gif";
  if (buf.subarray(4, 12).toString("ascii").startsWith("ftypavi")) return "image/avif";
  return null;
}

/** Saves an uploaded image and returns its public URL (/uploads/xxx.jpg). */
export async function saveImage(file: File): Promise<string> {
  if (file.size > MAX_BYTES) throw new Error(`"${file.name}" is larger than 8 MB`);
  const buf = Buffer.from(await file.arrayBuffer());
  const type = sniff(buf);
  if (!type || !TYPES[type]) throw new Error(`"${file.name}" is not a supported image (JPG, PNG, WEBP, GIF, AVIF)`);
  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${Date.now()}-${randomBytes(8).toString("hex")}.${TYPES[type]}`;
  await writeFile(path.join(UPLOAD_DIR, name), buf);
  return `/uploads/${name}`;
}

export async function saveImages(files: File[]) {
  const urls: string[] = [];
  for (const f of files) {
    if (f && f.size > 0) urls.push(await saveImage(f));
  }
  return urls;
}

export async function deleteImage(url: string | null | undefined) {
  if (!url || !url.startsWith("/uploads/")) return;
  const name = path.basename(url);
  try {
    await unlink(path.join(UPLOAD_DIR, name));
  } catch {
    /* already gone */
  }
}

export function contentTypeFor(file: string) {
  const ext = path.extname(file).slice(1).toLowerCase();
  const found = Object.entries(TYPES).find(([, e]) => e === ext);
  return found?.[0] ?? "application/octet-stream";
}
