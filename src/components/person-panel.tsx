import { PpeIcon } from "@/components/ppe-icon";
import { Badge } from "@/components/ui/badge";
import { ppeLabel, t } from "@/lib/ppe/i18n";
import type { Locale, PersonDetection, PpeId } from "@/lib/ppe/types";
import { cn } from "@/lib/utils";

export function PersonPanel({
  person,
  locale,
  required,
}: {
  person: PersonDetection;
  locale: Locale;
  required: PpeId[];
}) {
  const items = Array.from(new Set([...required, ...person.present, ...person.missing]));
  return (
    <div className="rounded-lg bg-elevated p-3 shadow-[var(--shadow-border)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-xs text-muted">{person.id}</span>
        <Badge tone={person.compliant ? "safe" : "danger"}>
          {person.compliant
            ? locale === "ar"
              ? "ملتزم"
              : "Compliant"
            : t(locale, "kpi.missing")}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {items.map((id) => {
          const ok = person.present.includes(id);
          const miss = person.missing.includes(id) || (required.includes(id) && !ok);
          return (
            <div
              key={id}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs",
                miss ? "bg-danger-dim text-danger" : "bg-safe-dim text-safe",
              )}
            >
              <PpeIcon id={id} className="size-3.5" />
              <span>{ppeLabel(locale, id)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
