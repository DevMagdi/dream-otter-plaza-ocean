import { createHash, randomBytes } from "node:crypto";
import { env } from "@/lib/env.server";
import type { AnalysisResult, PpeId } from "./types";
import { PPE_CATALOG } from "./profiles";

export function hashIngestKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function newIngestKey(): string {
  return `aegis_live_${randomBytes(24).toString("hex")}`;
}

export function yoloConfigured(): boolean {
  return Boolean(env("YOLO_DETECTOR_URL"));
}

function asPpe(list: unknown): PpeId[] {
  if (!Array.isArray(list)) return [];
  const allow = new Set<string>(PPE_CATALOG);
  const out: PpeId[] = [];
  for (const item of list) {
    if (typeof item === "string" && allow.has(item) && !out.includes(item as PpeId)) {
      out.push(item as PpeId);
    }
  }
  return out;
}

export function normalizeYoloResult(raw: unknown, required: PpeId[]): AnalysisResult | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const personsIn = Array.isArray(rec.persons) ? rec.persons : [];
  const persons = personsIn.map((p, i) => {
    const row = (p ?? {}) as Record<string, unknown>;
    const bboxRaw = (row.bbox ?? {}) as Record<string, unknown>;
    const present = asPpe(row.present);
    const missing = required.filter((id) => !present.includes(id));
    return {
      id: typeof row.id === "string" ? row.id.slice(0, 20) : `P${i + 1}`,
      bbox: {
        x: clamp(Number(bboxRaw.x)),
        y: clamp(Number(bboxRaw.y)),
        w: clamp(Number(bboxRaw.w) || 0.2),
        h: clamp(Number(bboxRaw.h) || 0.4),
      },
      present,
      missing,
      confidence: clamp(Number(row.confidence) || 0.7),
      compliant: missing.length === 0,
    };
  });
  const viol = persons.filter((p) => !p.compliant).length;
  let risk: AnalysisResult["risk"] = "low";
  if (persons.some((p) => p.missing.includes("harness"))) risk = "critical";
  else if (viol / Math.max(1, persons.length) >= 0.66) risk = "high";
  else if (viol) risk = "medium";
  return {
    persons,
    scene: typeof rec.scene === "string" ? rec.scene : "YOLO",
    risk,
    summary: typeof rec.summary === "string" ? rec.summary : `${viol} of ${persons.length} missing PPE.`,
    summaryAr: typeof rec.summaryAr === "string" ? rec.summaryAr : `${viol} من ${persons.length} عمال تنقصهم معدات.`,
  };
}

function clamp(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export async function inspectWithYolo(
  detectorUrl: string,
  imageDataUrl: string,
  required: PpeId[],
): Promise<AnalysisResult | null> {
  const base = detectorUrl.replace(/\/$/, "");
  if (!/^https?:\/\//i.test(base)) return null;
  try {
    const res = await fetch(`${base}/inspect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageDataUrl, required }),
      signal: AbortSignal.timeout(4_000),
    });
    if (!res.ok) return null;
    return normalizeYoloResult(await res.json(), required);
  } catch {
    return null;
  }
}
