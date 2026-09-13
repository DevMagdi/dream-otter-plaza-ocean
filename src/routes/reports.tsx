import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { briefBody, briefSubject, mailtoHref } from "@/lib/ppe/hourly";
import { formatDateTime, ppeLabel, t } from "@/lib/ppe/i18n";
import { PPE_CATALOG } from "@/lib/ppe/profiles";
import { usePpeStore } from "@/lib/ppe/store";
import type { PpeId } from "@/lib/ppe/types";

export const Route = createFileRoute("/reports")({ component: ReportsPage });

function ReportsPage() {
  const locale = usePpeStore((s) => s.locale);
  const incidents = usePpeStore((s) => s.incidents);
  const sites = usePpeStore((s) => s.sites);
  const cameras = usePpeStore((s) => s.cameras);
  const scans = usePpeStore((s) => s.scans);
  const briefs = usePpeStore((s) => s.briefs);
  const settings = usePpeStore((s) => s.settings);
  const generateBrief = usePpeStore((s) => s.generateBrief);
  const markBriefSent = usePpeStore((s) => s.markBriefSent);

  const hours = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() - (11 - i));
    const start = d.getTime();
    const end = start + 3600_000;
    const count = incidents.filter((x) => x.at >= start && x.at < end).length;
    return {
      label: new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
        hour: "2-digit",
      }).format(d),
      count,
    };
  });

  const byPpe = PPE_CATALOG.map((id) => ({
    id,
    name: ppeLabel(locale, id),
    count: incidents.filter((i) => i.missing.includes(id)).length,
  }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);

  const bySite = sites.map((site) => {
    const related = scans.filter((s) => s.siteId === site.id);
    const persons = related.reduce((n, s) => n + s.persons, 0);
    const viol = related.reduce((n, s) => n + s.violations, 0);
    const pct = persons ? Math.round(((persons - viol) / persons) * 100) : 100;
    return {
      name: locale === "ar" ? site.nameAr : site.name,
      pct,
    };
  });

  function sendBrief(id: string) {
    const brief = briefs.find((b) => b.id === id);
    if (!brief) return;
    if (!settings.managerEmail.trim()) {
      toast.error(t(locale, "settings.emailMissing"));
      return;
    }
    const subject = briefSubject(brief, locale);
    const body = briefBody(brief, locale, sites, settings.managerName);
    markBriefSent(brief.id);
    window.location.href = mailtoHref(settings.managerEmail.trim(), subject, body);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-2xs uppercase tracking-widest text-subtle">HSE</p>
            <h1 className="mt-2 text-3xl font-medium tracking-tight">
              {t(locale, "reports.title")}
            </h1>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              generateBrief();
              toast.success(t(locale, "toast.briefReady"));
            }}
          >
            {t(locale, "reports.sendNow")}
          </Button>
        </header>

        <Card>
          <h2 className="mb-4 text-base font-medium">{t(locale, "reports.hourly")}</h2>
          {briefs.length === 0 ? (
            <p className="text-sm text-muted">{t(locale, "reports.emptyHour")}</p>
          ) : (
            <ul className="space-y-3">
              {briefs.slice(0, 6).map((brief) => (
                <li
                  key={brief.id}
                  className="rounded-lg bg-elevated px-3 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={brief.status === "sent" ? "safe" : "warn"}>
                          {t(locale, `reports.${brief.status}`)}
                        </Badge>
                        <span className="font-mono text-xs text-muted tabular">
                          {formatDateTime(locale, brief.from)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm">
                        {brief.violationCount
                          ? locale === "ar"
                            ? `${brief.violationCount} مخالفة`
                            : `${brief.violationCount} violation(s)`
                          : t(locale, "reports.emptyHour")}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {brief.people.slice(0, 4).map((p, i) => {
                          const cam = cameras.find((c) => c.id === p.cameraId);
                          return (
                            <li key={`${brief.id}-${i}`} className="truncate text-xs text-muted">
                              {(cam ? (locale === "ar" ? cam.nameAr : cam.name) : p.cameraId) +
                                " · " +
                                p.personId +
                                " · " +
                                p.missing.map((m) => ppeLabel(locale, m)).join(", ")}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    {brief.status === "ready" ? (
                      <Button size="sm" onClick={() => sendBrief(brief.id)}>
                        {t(locale, "reports.send")}
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="h-72">
          <h2 className="mb-3 text-sm font-medium">{t(locale, "reports.byHour")}</h2>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={hours}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                cursor={{ fill: "var(--color-elevated)" }}
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  color: "var(--color-fg)",
                }}
              />
              <Bar dataKey="count" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="mb-3 text-sm font-medium">{t(locale, "reports.byPpe")}</h2>
            <ul className="space-y-2">
              {byPpe.map((row) => (
                <li key={row.id as PpeId} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate text-sm">{row.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-elevated">
                    <div
                      className="h-full rounded-full bg-danger"
                      style={{
                        width: `${Math.min(100, row.count * 12)}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-end font-mono text-xs tabular">{row.count}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h2 className="mb-3 text-sm font-medium">{t(locale, "reports.bySite")}</h2>
            <ul className="space-y-2">
              {bySite.map((row) => (
                <li key={row.name} className="flex items-center gap-3">
                  <span className="min-w-0 flex-1 truncate text-sm">{row.name}</span>
                  <span
                    className={
                      row.pct >= 85
                        ? "font-mono text-sm text-safe tabular"
                        : "font-mono text-sm text-danger tabular"
                    }
                  >
                    {row.pct}%
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
