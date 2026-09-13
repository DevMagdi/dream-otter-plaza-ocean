import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { AnalysisResult, PpeId, PersonDetection, RiskLevel } from "./types";
import { failClosedResult, offlineSampleResult } from "./offline";
import { PPE_CATALOG } from "./profiles";

const Input = z.object({
  imageDataUrl: z
    .string()
    .min(32)
    .max(1_600_000)
    .refine((s) => /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(s)),
  required: z.array(z.enum(PPE_CATALOG as [PpeId, ...PpeId[]])).max(12),
  industry: z.string().max(40),
  zone: z.string().max(80),
  cameraId: z.string().max(40).optional(),
});

const SYSTEM = `You are an industrial HSE computer-vision inspector.
Detect every person in the image and which personal protective equipment (PPE) they wear.
PPE ids you may use: helmet, vest, goggles, gloves, boots, mask, facemask, ear, harness, faceshield, coverall, labcoat, hairnet.
Bounding boxes are normalized 0-1 of the full image: x,y = top-left, w,h = size. Boxes must tightly cover each person.
If a required item is not clearly visible, mark it missing.
Return JSON only with this shape:
{
  "persons": [
    {
      "id": "P1",
      "bbox": { "x": 0.12, "y": 0.08, "w": 0.25, "h": 0.7 },
      "present": ["helmet","vest"],
      "missing": ["goggles"],
      "confidence": 0.9,
      "notes": "short"
    }
  ],
  "scene": "short english scene",
  "sceneAr": "وصف عربي قصير",
  "summary": "one english sentence",
  "summaryAr": "جملة عربية واحدة",
  "risk": "low" | "medium" | "high" | "critical"
}
No people → persons: []. Never invent workers.`;

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

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function parseResult(raw: string, required: PpeId[]): AnalysisResult {
  const jsonText = raw.replace(/```json|```/g, "").trim();
  const start = jsonText.indexOf("{");
  const end = jsonText.lastIndexOf("}");
  const parsed = JSON.parse(jsonText.slice(start, end + 1)) as Record<string, unknown>;
  const personsIn = Array.isArray(parsed.persons) ? parsed.persons : [];
  const persons: PersonDetection[] = personsIn.map((p, i) => {
    const rec = (p ?? {}) as Record<string, unknown>;
    const bboxRaw = (rec.bbox ?? {}) as Record<string, unknown>;
    const present = asPpe(rec.present);
    const missingListed = asPpe(rec.missing);
    const missing = required.filter((id) => !present.includes(id));
    const extraMissing = missingListed.filter((id) => !present.includes(id) && !missing.includes(id));
    const bbox = {
      x: clamp01(Number(bboxRaw.x)),
      y: clamp01(Number(bboxRaw.y)),
      w: clamp01(Number(bboxRaw.w) || 0.2),
      h: clamp01(Number(bboxRaw.h) || 0.4),
    };
    return {
      id: typeof rec.id === "string" ? rec.id : `P${i + 1}`,
      bbox,
      present,
      missing: [...missing, ...extraMissing],
      confidence: clamp01(Number(rec.confidence) || 0.7),
      compliant: missing.length === 0,
      notes: typeof rec.notes === "string" ? rec.notes : undefined,
    };
  });

  const viol = persons.filter((p) => !p.compliant).length;
  let risk: RiskLevel = "low";
  if (persons.length === 0) risk = "low";
  else if (viol === 0) risk = "low";
  else if (persons.some((p) => p.missing.includes("harness"))) risk = "critical";
  else if (viol / persons.length >= 0.66) risk = "high";
  else risk = "medium";
  const parsedRisk = parsed.risk;
  if (parsedRisk === "low" || parsedRisk === "medium" || parsedRisk === "high" || parsedRisk === "critical") {
    risk = parsedRisk;
    if (viol === 0) risk = "low";
    if (persons.some((p) => p.missing.includes("harness"))) risk = "critical";
  }

  return {
    persons,
    scene: typeof parsed.scene === "string" ? parsed.scene : "",
    risk,
    summary:
      typeof parsed.summary === "string"
        ? parsed.summary
        : viol
          ? `${viol} of ${persons.length} workers missing PPE.`
          : persons.length
            ? "All detected workers meet zone PPE."
            : "No workers detected.",
    summaryAr:
      typeof parsed.summaryAr === "string"
        ? parsed.summaryAr
        : viol
          ? `${viol} من ${persons.length} عمال تنقصهم معدات وقاية.`
          : persons.length
            ? "كل العمال المكتشفين ملتزمون."
            : "لا يوجد عمال في الإطار.",
  };
}

async function actorFromRequest(fallback: string): Promise<string> {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    if (!req) return fallback;
    const authz = req.headers.get("authorization") || "";
    const bearer = authz.toLowerCase().startsWith("bearer ") ? authz.slice(7).trim() : "";
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/(?:^|;\s*)aegis_sid=([^;]+)/);
    const token = bearer || (match ? decodeURIComponent(match[1]) : "");
    if (!token) return fallback;
    const sql = await getSql();
    const ses = await sql.query<{ userId: string }>(
      'select "userId" from "session" where token = $1 and "expiresAt" > $2 limit 1',
      [token, new Date().toISOString()],
    );
    return ses[0]?.userId || fallback;
  } catch {
    return fallback;
  }
}

export const analyzePpe = createServerFn({ method: "POST" })
  .validator(Input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<{ ok: true; result: AnalysisResult; source?: string } | { ok: false; error: string }> => {
    const required = asPpe(data.required);
    const sample = offlineSampleResult(data.cameraId, required);
    if (sample) return { ok: true, result: sample, source: "offline" };

    const userId = await actorFromRequest(context.userId);
    const sql = await getSql();
    let detector = (process.env.YOLO_DETECTOR_URL || "http://127.0.0.1:8090").replace(/\/$/, "");
    try {
      const member = await sql<{ org_id: string }>`select org_id from memberships where user_id = ${userId} limit 1`;
      if (member[0]) {
        const settings = await sql<{ detector_url: string }>`select detector_url from org_settings where org_id = ${member[0].org_id} limit 1`;
        const custom = (settings[0]?.detector_url || "").replace(/\/$/, "");
        if (custom) detector = custom;
      }
    } catch {
      /* use default detector */
    }
    const { inspectWithYolo } = await import("./yolo");
    const yolo = await inspectWithYolo(detector, data.imageDataUrl, required);
    if (yolo) return { ok: true, result: yolo, source: "yolo" };

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: true, result: failClosedResult(required), source: "local" };
    const userText = `Industry: ${data.industry}. Zone: ${data.zone}. Required PPE: ${required.join(", ") || "none specified"}. Inspect every person.`;

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0,
        max_tokens: 1400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: [
              { type: "text", text: userText },
              {
                type: "image_url",
                image_url: { url: data.imageDataUrl, detail: "high" },
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const retry = await fetch("https://api.x.ai/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          input: [
            {
              role: "user",
              content: [
                { type: "input_image", image_url: data.imageDataUrl, detail: "high" },
                { type: "input_text", text: `${SYSTEM}\n\n${userText}` },
              ],
            },
          ],
        }),
      });
      if (!retry.ok) return { ok: true, result: failClosedResult(required), source: "local" };
      const retryBody = (await retry.json()) as {
        output_text?: string;
        output?: { content?: { text?: string }[] }[];
      };
      const text =
        retryBody.output_text ??
        retryBody.output?.map((o) => o.content?.map((c) => c.text ?? "").join("") ?? "").join("") ??
        "";
      try {
        return { ok: true, result: parseResult(text, required) };
      } catch {
        return { ok: false, error: "parse" };
      }
    }

    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = body.choices?.[0]?.message?.content ?? "";
    try {
      return { ok: true, result: parseResult(text, required) };
    } catch {
      return { ok: false, error: "parse" };
    }
  });
