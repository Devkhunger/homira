import { readFile } from "fs/promises";
import path from "path";
import { UPLOAD_DIR, contentTypeFor } from "@/lib/uploads";

// Serves images uploaded from the admin panel.
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const name = path.basename(parts.join("/")); // prevents ../ traversal
  if (!/^[\w.-]+$/.test(name)) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(path.join(UPLOAD_DIR, name));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": contentTypeFor(name),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
