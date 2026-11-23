"use server";

import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { getSettings, isJobAcceptingApplications } from "@/lib/cms";
import { allow, clientIp } from "@/lib/rate-limit";
import { deleteUpload, hasFile, saveUpload } from "@/lib/storage";
import { firstError, str, type FormState } from "../form";

const TRY_LATER = "Something went wrong on our side. Please try again in a moment.";

async function notify(kind: "contact" | "application", subject: string, text: string, replyTo: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const settings = await getSettings();
  const to = (kind === "contact" ? settings.contactNotifyEmail : settings.applicationNotifyEmail)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (!apiKey || to.length === 0) return;
  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: process.env.CONTACT_FROM_EMAIL || "Aventra Website <onboarding@resend.dev>",
      to,
      subject,
      text,
      replyTo,
    });
    if (error) console.error("[email] send failed:", error);
  } catch (error) {
    // The submission is already saved in the admin, so an email failure must not fail the form.
    console.error("[email] send failed:", error);
  }
}

const messageSchema = z.object({
  name: z.string().min(2, "Please enter your name.").max(120),
  email: z.email("Please enter a valid email address."),
  message: z.string().min(10, "Please write a message of at least 10 characters.").max(5000),
});

export async function sendMessage(_prev: FormState, data: FormData): Promise<FormState> {
  // Hidden field that only bots fill in; pretend success so they do not retry.
  if (str(data, "company")) return { ok: "Thank you. Your message has been sent." };
  if (!allow(`contact:${await clientIp()}`, 5, 10 * 60 * 1000)) {
    return { error: "You have sent several messages already. Please try again later." };
  }
  const parsed = messageSchema.safeParse({
    name: str(data, "name"),
    email: str(data, "email"),
    message: str(data, "message"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  try {
    await getDb().insert(schema.messages).values(parsed.data);
  } catch (error) {
    console.error("[contact] could not save message:", error);
    return { error: TRY_LATER };
  }
  await notify(
    "contact",
    `New website message from ${parsed.data.name}`,
    `Name: ${parsed.data.name}\nEmail: ${parsed.data.email}\n\n${parsed.data.message}`,
    parsed.data.email,
  );
  return { ok: "Thank you. Your message has been sent and we will get back to you soon." };
}

const applicationSchema = z.object({
  name: z.string().min(2, "Please enter your name.").max(120),
  email: z.email("Please enter a valid email address."),
  phone: z.string().min(6, "Please enter a phone number.").max(40),
  coverNote: z.string().max(5000),
});

export async function applyToJob(
  jobId: number,
  _prev: FormState,
  data: FormData,
): Promise<FormState> {
  if (str(data, "company")) return { ok: "Thank you. Your application has been received." };
  if (!allow(`apply:${await clientIp()}`, 5, 60 * 60 * 1000)) {
    return { error: "You have submitted several applications already. Please try again later." };
  }
  const parsed = applicationSchema.safeParse({
    name: str(data, "name"),
    email: str(data, "email"),
    phone: str(data, "phone"),
    coverNote: str(data, "coverNote"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const cv = data.get("cv");
  if (!hasFile(cv)) return { error: "Please attach your CV (PDF, DOC or DOCX, up to 5 MB)." };

  let job;
  try {
    job = (await getDb().select().from(schema.jobs).where(eq(schema.jobs.id, jobId)).limit(1))[0];
  } catch (error) {
    console.error("[apply] could not load job:", error);
    return { error: TRY_LATER };
  }
  if (!job || !isJobAcceptingApplications(job)) {
    return { error: "This position is no longer accepting applications." };
  }

  const saved = await saveUpload("cv", cv);
  if (!saved.ok) return { error: saved.error };
  try {
    await getDb().insert(schema.applications).values({
      jobId,
      ...parsed.data,
      cvFile: saved.file,
      cvName: saved.originalName,
    });
  } catch (error) {
    console.error("[apply] could not save application:", error);
    await deleteUpload("cv", saved.file);
    return { error: TRY_LATER };
  }
  await notify(
    "application",
    `New application: ${job.title}`,
    `${parsed.data.name} (${parsed.data.email}, ${parsed.data.phone}) applied for ${job.title}.\nOpen the admin panel to view the CV.`,
    parsed.data.email,
  );
  return { ok: "Thank you. Your application has been received." };
}
