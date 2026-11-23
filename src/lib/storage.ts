import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

type Kind = "images" | "cv";

const rules: Record<Kind, { maxBytes: number; types: Record<string, string> }> = {
  images: {
    maxBytes: 4 * 1024 * 1024,
    types: { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" },
  },
  cv: {
    maxBytes: 5 * 1024 * 1024,
    types: {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  },
};

const storedName = /^[a-f0-9]{32}\.[a-z0-9]{2,5}$/;

function root() {
  // Uploads live outside the build, so the bundler must not try to trace this folder.
  return path.resolve(/*turbopackIgnore: true*/ process.env.STORAGE_DIR || "./storage");
}

function startsWith(bytes: Buffer, signature: number[]) {
  return signature.every((byte, index) => bytes[index] === byte);
}

/** Checks the real file signature, since the extension and MIME type are user-supplied. */
function looksLike(ext: string, bytes: Buffer) {
  switch (ext) {
    case "pdf":
      return startsWith(bytes, [0x25, 0x50, 0x44, 0x46]);
    case "docx":
      return startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]);
    case "doc":
      return startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0]);
    case "png":
      return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47]);
    case "jpg":
    case "jpeg":
      return startsWith(bytes, [0xff, 0xd8, 0xff]);
    case "webp":
      return (
        bytes.subarray(0, 4).toString("latin1") === "RIFF" &&
        bytes.subarray(8, 12).toString("latin1") === "WEBP"
      );
    default:
      return false;
  }
}

export type SaveResult =
  | { ok: true; file: string; originalName: string }
  | { ok: false; error: string };

export async function saveUpload(kind: Kind, file: File): Promise<SaveResult> {
  const rule = rules[kind];
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const allowed = Object.keys(rule.types).join(", ").toUpperCase();
  if (!rule.types[ext]) return { ok: false, error: `File type not allowed. Use ${allowed}.` };
  if (file.size > rule.maxBytes) {
    return { ok: false, error: `File is too large (max ${rule.maxBytes / 1024 / 1024} MB).` };
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!looksLike(ext, bytes)) {
    return { ok: false, error: `The file does not look like a valid ${ext.toUpperCase()} file.` };
  }
  const name = `${randomBytes(16).toString("hex")}.${ext}`;
  const dir = path.join(/*turbopackIgnore: true*/ root(), kind);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(/*turbopackIgnore: true*/ dir, name), bytes);
  return { ok: true, file: name, originalName: file.name.slice(0, 190) };
}

export async function readUpload(kind: Kind, name: string) {
  if (!storedName.test(name)) return null;
  const ext = name.split(".").pop()!;
  const type = rules[kind].types[ext];
  if (!type) return null;
  try {
    return { bytes: await readFile(path.join(/*turbopackIgnore: true*/ root(), kind, name)), type };
  } catch {
    return null;
  }
}

export async function deleteUpload(kind: Kind, name: string) {
  if (!storedName.test(name)) return;
  await unlink(path.join(/*turbopackIgnore: true*/ root(), kind, name)).catch(() => {});
}

export function hasFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}
