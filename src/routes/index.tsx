import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowUpRight, Camera, Mail } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ComplianceRing } from "@/components/compliance-ring";
import { RiskBadge } from "@/components/risk-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { applyChecks } from "@/lib/ppe/checks";
import { formatRelative, industryLabel, ppeLabel, t } from "@/lib/ppe/i18n";
import { cameraRuleOf, usePpeStore } from "@/lib/ppe/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const locale = usePpeStore((s) => s.locale);
  const role = usePpeStore((s) => s.role);
  const sites = usePpeStore((s) => s.sites);
  const cameras = usePpeStore((s) => s.cameras);
  const incidents = usePpeStore((s) => s.incidents);
  const scans = usePpeStore((s) => s.scans);
  const cameraRules = usePpeStore((s) => s.cameraRules);
  const settings = usePpeStore((s) => s.settings);
  const briefs = usePpeStore((s) => s.briefs);
  if (role === "platform") return <Navigate to="/platform" />;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayScans = scans.filter((s) => s.at >= startOfDay.getTime());
  const open = incidents.filter((i) => i.status === "open");
  const recent = [...incidents].sort((a, b) => b.at - a.at).slice(0, 5);
  const latestBrief = briefs[0];
  const personsToday = todayScans.reduce((n, s) => n + s.persons, 0);
  const violToday = todayScans.reduce((n, s) => n + s.violations, 0);
  const compliance = personsToday ? (personsToday - violToday) / personsToday : 1;
  const liveCams = cameras.filter((c) => cameraRuleOf(cameraRules, c.id).enabled).length;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-2xs uppercase tracking-widest text-subtle">{t(locale, "tagline")}</p>
            <h1 className="mt-1 text-3xl font-medium tracking-tight">{t(locale, "nav.dashboard")}</h1>
          </div>
          <Link
            to="/scan"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm text-primary-fg"
          >
            {t(locale, "scan.analyze")}
            <ArrowUpRight className="size-4" />
          </Link>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="flex items-center gap-4 p-4">
            <ComplianceRing value={compliance} label={t(locale, "kpi.compliance")} />
            <div>
              <p className="text-xs text-muted">{t(locale, "kpi.compliance")}</p>
              <p className="text-2xl font-medium">{Math.round(compliance * 100)}%</p>
            </div>
          </Card>
          <Kpi label={t(locale, "kpi.open")} value={open.length} />
          <Kpi label={t(locale, "kpi.scans")} value={todayScans.length} />
          <Kpi label={t(locale, "kpi.cameras")} value={liveCams} />
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium">{t(locale, "incident.title")}</h2>
              <Link to="/incidents" className="text-xs text-accent">
                {t(locale, "incident.filter")}
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">{t(locale, "incident.empty")}</p>
            ) : (
              <ul className="space-y-2">
                {recent.map((inc) => {
                  const site = sites.find((s) => s.id === inc.siteId);
                  return (
                    <li key={inc.id} className="flex items-center justify-between gap-2 rounded-xl bg-elevated px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm">
                          {locale === "ar" ? inc.summaryAr : inc.summary}
                        </p>
                        <p className="text-2xs text-muted">
                          {site ? (locale === "ar" ? site.nameAr : site.name) : inc.siteId}
                          {" · "}
                          {formatRelative(locale, inc.at)}
                        </p>
                      </div>
                      <RiskBadge risk={inc.risk} locale={locale} />
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Mail className="size-4 text-muted" />
              <h2 className="text-sm font-medium">{t(locale, "reports.hourly")}</h2>
            </div>
            {latestBrief ? (
              <p className="text-sm text-muted">
                {t(locale, latestBrief.status === "sent" ? "reports.sent" : "reports.ready")}
                {" · "}
                {latestBrief.violationCount} {t(locale, "kpi.missing")}
              </p>
            ) : (
              <p className="text-sm text-muted">{t(locale, "reports.emptyHour")}</p>
            )}
            <p className="mt-2 text-xs text-subtle">
              {settings.managerEmail || t(locale, "settings.manager")}
            </p>
          </Card>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium">{t(locale, "kpi.cameras")}</h2>
          {cameras.length === 0 ? (
            <Card className="py-10 text-center text-sm text-muted">
              <Camera className="mx-auto mb-2 size-6 text-subtle" />
              {t(locale, "cameras.empty")}
              <div className="mt-3">
                <Link to="/sites" className="text-sm text-accent">
                  {t(locale, "cameras.add")}
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {cameras.map((cam) => {
                const rule = cameraRuleOf(cameraRules, cam.id);
                const site = sites.find((s) => s.id === cam.siteId);
                const viewed = cam.cached ? applyChecks(cam.cached, rule.checks) : null;
                return (
                  <Link key={cam.id} to="/scan" search={{ cam: cam.id }} className="block">
                    <Card className="overflow-hidden p-0">
                      <div className="relative aspect-video bg-elevated">
                        {cam.image ? (
                          <img src={cam.image} alt="" className="size-full object-cover" />
                        ) : (
                          <div className="grid size-full place-items-center text-subtle">
                            <Camera className="size-8" />
                          </div>
                        )}
                        <Badge
                          className="absolute start-2 top-2"
                          tone={rule.enabled ? "safe" : "mute"}
                        >
                          {cam.id}
                        </Badge>
                      </div>
                      <div className="space-y-1 p-3">
                        <p className="text-sm font-medium">{locale === "ar" ? cam.nameAr : cam.name}</p>
                        <p className="text-2xs text-muted">
                          {site ? (locale === "ar" ? site.nameAr : site.name) : ""}
                          {site ? " · " : ""}
                          {site ? industryLabel(locale, site.industry) : ""}
                        </p>
                        <p className="text-2xs text-subtle">
                          {rule.checks.map((id) => ppeLabel(locale, id)).join(" · ") || "—"}
                        </p>
                        {viewed ? (
                          <p className={cn("text-xs", viewed.risk === "low" ? "text-safe" : "text-danger")}>
                            {locale === "ar" ? viewed.summaryAr : viewed.summary}
                          </p>
                        ) : null}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 text-3xl font-medium">{value}</p>
    </Card>
  );
}
