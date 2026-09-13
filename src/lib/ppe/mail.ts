import nodemailer from "nodemailer";
import { env } from "@/lib/env.server";

export function mailConfigured(): boolean {
  return Boolean(env("SMTP_HOST") && env("SMTP_FROM"));
}

function transport() {
  const host = env("SMTP_HOST");
  const from = env("SMTP_FROM");
  if (!host || !from) return null;
  const port = Number(env("SMTP_PORT") || "587");
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465 || env("SMTP_SECURE") === "true",
    auth: env("SMTP_USER")
      ? { user: env("SMTP_USER") as string, pass: env("SMTP_PASS") ?? "" }
      : undefined,
  });
}

export async function sendMail(input: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const to = input.to.trim();
  if (!to || !to.includes("@")) return { ok: false, error: "recipient" };
  const tx = transport();
  if (!tx) return { ok: false, error: "not_configured" };
  try {
    await tx.sendMail({
      from: env("SMTP_FROM"),
      to,
      subject: input.subject.slice(0, 180),
      text: input.text.slice(0, 20_000),
    });
    return { ok: true };
  } catch (err) {
    console.error("[smtp]", err);
    return { ok: false, error: "send" };
  }
}
