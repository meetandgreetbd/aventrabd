import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { readUpload } from "@/lib/storage";

/** CV view or download for logged-in admins only. Applicants' files are never publicly reachable. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentUser())) return new Response("Not found", { status: 404 });
  const { id } = await params;
  if (!/^\d{1,9}$/.test(id)) return new Response("Not found", { status: 404 });
  const inline = new URL(request.url).searchParams.get("inline") === "1";

  const row = (
    await getDb()
      .select({ cvFile: schema.applications.cvFile, cvName: schema.applications.cvName })
      .from(schema.applications)
      .where(eq(schema.applications.id, Number(id)))
      .limit(1)
  )[0];
  const file = row && (await readUpload("cv", row.cvFile));
  if (!row || !file) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.type,
      // Download by default; "inline" opens the file in a browser tab (PDFs display directly).
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(row.cvName)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
