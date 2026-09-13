import type { AnalysisResult, PpeId, RiskLevel } from "./types";

export function applyChecks(result: AnalysisResult, checks: PpeId[]): AnalysisResult {
  const need = checks.length ? checks : [];
  const persons = result.persons.map((p) => {
    const missing = need.filter((id) => !p.present.includes(id));
    return { ...p, missing, compliant: missing.length === 0 };
  });
  const viol = persons.filter((p) => !p.compliant).length;
  let risk: RiskLevel = "low";
  if (viol === 0) risk = "low";
  else if (persons.some((p) => p.missing.includes("harness"))) risk = "critical";
  else if (viol / Math.max(1, persons.length) >= 0.5) risk = "high";
  else risk = "medium";

  const summary =
    viol === 0
      ? persons.length
        ? "All detected workers meet this camera's checks."
        : "No workers detected."
      : `${viol} of ${persons.length} workers missing checked PPE.`;
  const summaryAr =
    viol === 0
      ? persons.length
        ? "كل العمال المكتشفين يطابقون فحص هذه الكاميرا."
        : "لا يوجد عمال في الإطار."
      : `${viol} من ${persons.length} عمال ينقصهم معدات هذا الفحص.`;

  return { ...result, persons, risk, summary, summaryAr };
}
