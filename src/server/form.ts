import type { z } from "zod";

export type FormState = { error?: string; ok?: string } | null;

export function str(data: FormData, key: string) {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function checked(data: FormData, key: string) {
  return data.get(key) === "on";
}

export function int(data: FormData, key: string) {
  const value = Number.parseInt(str(data, key), 10);
  return Number.isFinite(value) ? value : 0;
}

export function firstError(error: z.ZodError) {
  const issue = error.issues[0];
  return issue ? issue.message : "Please check the form and try again.";
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}
