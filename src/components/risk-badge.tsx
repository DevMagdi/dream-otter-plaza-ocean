import { Badge } from "@/components/ui/badge";
import { riskLabel } from "@/lib/ppe/i18n";
import type { Locale, RiskLevel } from "@/lib/ppe/types";

const TONE: Record<RiskLevel, "safe" | "warn" | "danger"> = {
  low: "safe",
  medium: "warn",
  high: "danger",
  critical: "danger",
};

export function RiskBadge({ risk, locale }: { risk: RiskLevel; locale: Locale }) {
  return <Badge tone={TONE[risk]}>{riskLabel(locale, risk)}</Badge>;
}
