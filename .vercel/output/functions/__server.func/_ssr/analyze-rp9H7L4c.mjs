import { n as createServerFn } from "./ssr.mjs";
import { Qt as string, Ut as array, Yt as object } from "../_libs/@better-auth/core+[...].mjs";
import { n as PPE_CATALOG, r as authMiddleware } from "./profiles-DeO1U3zD.mjs";
import { t as createServerRpc } from "./createServerRpc-CN-evIEF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analyze-rp9H7L4c.js
var Input = object({
	imageDataUrl: string().min(32).max(16e5),
	required: array(string()).max(20),
	industry: string().max(40),
	zone: string().max(80)
});
var SYSTEM = `You are an industrial HSE computer-vision inspector.
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
function asPpe(list) {
	if (!Array.isArray(list)) return [];
	const allow = new Set(PPE_CATALOG);
	const out = [];
	for (const item of list) if (typeof item === "string" && allow.has(item) && !out.includes(item)) out.push(item);
	return out;
}
function clamp01(n) {
	if (!Number.isFinite(n)) return 0;
	return Math.min(1, Math.max(0, n));
}
function parseResult(raw, required) {
	const jsonText = raw.replace(/```json|```/g, "").trim();
	const start = jsonText.indexOf("{");
	const end = jsonText.lastIndexOf("}");
	const parsed = JSON.parse(jsonText.slice(start, end + 1));
	const persons = (Array.isArray(parsed.persons) ? parsed.persons : []).map((p, i) => {
		const rec = p ?? {};
		const bboxRaw = rec.bbox ?? {};
		const present = asPpe(rec.present);
		const missingListed = asPpe(rec.missing);
		const missing = required.filter((id) => !present.includes(id));
		const extraMissing = missingListed.filter((id) => !present.includes(id) && !missing.includes(id));
		const bbox = {
			x: clamp01(Number(bboxRaw.x)),
			y: clamp01(Number(bboxRaw.y)),
			w: clamp01(Number(bboxRaw.w) || .2),
			h: clamp01(Number(bboxRaw.h) || .4)
		};
		return {
			id: typeof rec.id === "string" ? rec.id : `P${i + 1}`,
			bbox,
			present,
			missing: [...missing, ...extraMissing],
			confidence: clamp01(Number(rec.confidence) || .7),
			compliant: missing.length === 0,
			notes: typeof rec.notes === "string" ? rec.notes : void 0
		};
	});
	const viol = persons.filter((p) => !p.compliant).length;
	let risk = "low";
	if (persons.length === 0) risk = "low";
	else if (viol === 0) risk = "low";
	else if (persons.some((p) => p.missing.includes("harness"))) risk = "critical";
	else if (viol / persons.length >= .66) risk = "high";
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
		summary: typeof parsed.summary === "string" ? parsed.summary : viol ? `${viol} of ${persons.length} workers missing PPE.` : persons.length ? "All detected workers meet zone PPE." : "No workers detected.",
		summaryAr: typeof parsed.summaryAr === "string" ? parsed.summaryAr : viol ? `${viol} من ${persons.length} عمال تنقصهم معدات وقاية.` : persons.length ? "كل العمال المكتشفين ملتزمون." : "لا يوجد عمال في الإطار."
	};
}
var analyzePpe_createServerFn_handler = createServerRpc({
	id: "56557fc54da8b440c55dec9dcda6ed230658e991d88446ea4e5d0e58ac866503",
	name: "analyzePpe",
	filename: "src/lib/ppe/analyze.ts"
}, (opts) => analyzePpe.__executeServer(opts));
var analyzePpe = createServerFn({ method: "POST" }).validator(Input).middleware([authMiddleware]).handler(analyzePpe_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "unavailable"
	};
	const required = asPpe(data.required);
	const userText = `Industry: ${data.industry}. Zone: ${data.zone}. Required PPE: ${required.join(", ") || "none specified"}. Inspect every person.`;
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			temperature: 0,
			max_tokens: 1400,
			response_format: { type: "json_object" },
			messages: [{
				role: "system",
				content: SYSTEM
			}, {
				role: "user",
				content: [{
					type: "text",
					text: userText
				}, {
					type: "image_url",
					image_url: {
						url: data.imageDataUrl,
						detail: "high"
					}
				}]
			}]
		})
	});
	if (!res.ok) {
		const retry = await fetch("https://api.x.ai/v1/responses", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: "grok-4.5",
				input: [{
					role: "user",
					content: [{
						type: "input_image",
						image_url: data.imageDataUrl,
						detail: "high"
					}, {
						type: "input_text",
						text: `${SYSTEM}\n\n${userText}`
					}]
				}]
			})
		});
		if (!retry.ok) return {
			ok: false,
			error: `xAI API error ${res.status}`
		};
		const retryBody = await retry.json();
		const text = retryBody.output_text ?? retryBody.output?.map((o) => o.content?.map((c) => c.text ?? "").join("") ?? "").join("") ?? "";
		try {
			return {
				ok: true,
				result: parseResult(text, required)
			};
		} catch {
			return {
				ok: false,
				error: "parse"
			};
		}
	}
	const text = (await res.json()).choices?.[0]?.message?.content ?? "";
	try {
		return {
			ok: true,
			result: parseResult(text, required)
		};
	} catch {
		return {
			ok: false,
			error: "parse"
		};
	}
});
//#endregion
export { analyzePpe_createServerFn_handler };
