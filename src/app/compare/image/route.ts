import { readFile } from "node:fs/promises";
import path from "node:path";

/** Serves the reference design to the /compare page. Development only. */
export async function GET() {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
  try {
    const file = path.join(/*turbopackIgnore: true*/ process.cwd(), "brand-source", "design-mockup.jpg");
    const bytes = await readFile(file);
    return new Response(new Uint8Array(bytes), { headers: { "Content-Type": "image/jpeg" } });
  } catch {
    return new Response("Reference image not found in brand-source/", { status: 404 });
  }
}
