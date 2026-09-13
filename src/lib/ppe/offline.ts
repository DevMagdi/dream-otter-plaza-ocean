import { applyChecks } from "./checks";
import { CAMERAS } from "./demo";
import type { AnalysisResult, PpeId } from "./types";

export function offlineSampleResult(cameraId: string | undefined, required: PpeId[]): AnalysisResult | null {
  if (!cameraId) return null;
  const cam = CAMERAS.find((c) => c.id === cameraId);
  if (!cam?.cached) return null;
  return applyChecks(cam.cached, required);
}

/** Last-resort local result so Analyze never dies without a detector. */
export function failClosedResult(required: PpeId[]): AnalysisResult {
  const missing = [...required];
  return {
    persons: [
      {
        id: "P1",
        bbox: { x: 0.18, y: 0.08, w: 0.64, h: 0.85 },
        present: [],
        missing,
        confidence: 0.35,
        compliant: missing.length === 0,
      },
    ],
    scene: "Local inspector",
    risk: missing.includes("harness") ? "critical" : missing.length ? "high" : "low",
    summary: missing.length ? `Local inspect · missing ${missing.join(", ")}.` : "Local inspect.",
    summaryAr: missing.length
      ? `فحص محلي · ناقص: ${missing.join("، ")}.`
      : "فحص محلي بدون كاشف حي.",
  };
}
