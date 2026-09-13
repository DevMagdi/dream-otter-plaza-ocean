import { CAMERAS } from "./demo";
import { ppeLabel } from "./i18n";
import type { HourlyBrief, Incident, Locale, Site } from "./types";
import { uid } from "@/lib/utils";

export function buildBrief(incidents: Incident[], from: number, to: number): HourlyBrief {
  const windowed = incidents.filter((i) => i.at >= from && i.at < to && i.status !== "closed");
  const people = windowed.map((i) => ({
    cameraId: i.cameraId,
    siteId: i.siteId,
    personId: i.personId,
    missing: i.missing,
    at: i.at,
  }));
  return {
    id: uid("brief"),
    from,
    to,
    createdAt: Date.now(),
    status: "ready",
    violationCount: people.length,
    people,
  };
}

export function briefSubject(brief: HourlyBrief, locale: Locale): string {
  const hour = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(brief.from));
  return locale === "ar"
    ? `تقرير مخالفات الوقاية — ${hour} — ${brief.violationCount} مخالفة`
    : `PPE hourly brief — ${hour} — ${brief.violationCount} violation(s)`;
}

export function briefBody(
  brief: HourlyBrief,
  locale: Locale,
  sites: Site[],
  managerName: string,
): string {
  const lines: string[] = [];
  if (locale === "ar") {
    lines.push(`الأستاذ/ة ${managerName || "مدير السلامة"}،`);
    lines.push("");
    lines.push(
      brief.violationCount
        ? `خلال الساعة الماضية سُجّلت ${brief.violationCount} مخالفة معدات وقاية:`
        : "خلال الساعة الماضية لا توجد مخالفات مفتوحة.",
    );
  } else {
    lines.push(`${managerName || "Safety manager"},`);
    lines.push("");
    lines.push(
      brief.violationCount
        ? `${brief.violationCount} PPE violation(s) in the last hour:`
        : "No open PPE violations in the last hour.",
    );
  }
  lines.push("");
  for (const p of brief.people) {
    const cam = CAMERAS.find((c) => c.id === p.cameraId);
    const site = sites.find((s) => s.id === p.siteId);
    const camName = cam ? (locale === "ar" ? cam.nameAr : cam.name) : p.cameraId;
    const siteName = site ? (locale === "ar" ? site.nameAr : site.name) : p.siteId;
    const miss = p.missing.map((m) => ppeLabel(locale, m)).join(", ");
    lines.push(`• ${camName} — ${siteName} — ${p.personId} — ${miss}`);
  }
  lines.push("");
  lines.push(locale === "ar" ? "أيجيس — كشف معدات الوقاية" : "AEGIS — PPE Vision");
  return lines.join("\n");
}

export function mailtoHref(email: string, subject: string, body: string): string {
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
