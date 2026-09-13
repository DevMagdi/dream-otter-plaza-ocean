import { cn } from "@/lib/utils";
import type { Locale, PersonDetection } from "@/lib/ppe/types";
import { ppeLabel } from "@/lib/ppe/i18n";

export function DetectionOverlay({
  persons,
  locale,
}: {
  persons: PersonDetection[];
  locale: Locale;
}) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {persons.map((p) => {
        const ok = p.compliant;
        return (
          <div
            key={p.id}
            className={cn(
              "absolute rounded-sm border-2",
              ok ? "border-safe" : "border-danger",
            )}
            style={{
              left: `${p.bbox.x * 100}%`,
              top: `${p.bbox.y * 100}%`,
              width: `${p.bbox.w * 100}%`,
              height: `${p.bbox.h * 100}%`,
            }}
          >
            <div
              className={cn(
                "absolute -top-6 start-0 max-w-[220px] truncate rounded-sm px-1.5 py-0.5 font-mono text-[10px] leading-tight",
                ok ? "bg-safe text-safe-fg" : "bg-danger text-danger-fg",
              )}
            >
              {p.id}
              {!ok && p.missing.length
                ? ` · ${p.missing.map((m) => ppeLabel(locale, m)).join(" · ")}`
                : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}
