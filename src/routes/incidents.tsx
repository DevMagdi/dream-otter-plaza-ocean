import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { RiskBadge } from "@/components/risk-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime, ppeLabel, t } from "@/lib/ppe/i18n";
import { usePpeStore } from "@/lib/ppe/store";
import type { Incident } from "@/lib/ppe/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/incidents")({ component: IncidentsPage });

type Filter = "all" | Incident["status"];

function IncidentsPage() {
  const locale = usePpeStore((s) => s.locale);
  const sites = usePpeStore((s) => s.sites);
  const cameras = usePpeStore((s) => s.cameras);
  const incidents = usePpeStore((s) => s.incidents);
  const setStatus = usePpeStore((s) => s.setIncidentStatus);
  const ackOpen = usePpeStore((s) => s.ackOpen);
  const [filter, setFilter] = useState<Filter>("all");

  const rows = incidents
    .filter((i) => (filter === "all" ? true : i.status === filter))
    .sort((a, b) => b.at - a.at);

  const filters: Filter[] = ["all", "open", "ack", "closed"];

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-subtle">HSE</p>
            <h1 className="mt-1 text-2xl font-medium tracking-tight">
              {t(locale, "incident.title")}
            </h1>
          </div>
          <Button variant="secondary" size="sm" onClick={ackOpen}>
            {t(locale, "incident.ackAll")}
          </Button>
        </header>

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "h-9 rounded-full px-3 text-xs",
                filter === f ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
              )}
            >
              {f === "all" ? t(locale, "incident.filter") : t(locale, `incident.${f}`)}
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <Card className="py-12 text-center text-sm text-muted">
            {t(locale, "incident.empty")}
          </Card>
        ) : (
          <ul className="space-y-2">
            {rows.map((inc) => {
              const site = sites.find((s) => s.id === inc.siteId);
              const cam = cameras.find((c) => c.id === inc.cameraId);
              const zone = site?.zones.find((z) => z.id === inc.zoneId);
              return (
                <li key={inc.id}>
                  <Card className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                    {cam ? (
                      <img
                        src={cam.image}
                        alt=""
                        className="h-20 w-full rounded-md object-cover outline outline-1 -outline-offset-1 outline-fg/10 sm:h-16 sm:w-28"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <RiskBadge risk={inc.risk} locale={locale} />
                        <Badge
                          tone={
                            inc.status === "open"
                              ? "danger"
                              : inc.status === "ack"
                                ? "warn"
                                : "mute"
                          }
                        >
                          {t(locale, `incident.${inc.status}`)}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-sm">
                        {inc.missing.map((m) => ppeLabel(locale, m)).join(" · ")}
                      </p>
                      <p className="text-xs text-muted">
                        {site ? (locale === "ar" ? site.nameAr : site.name) : ""}
                        {zone ? ` · ${locale === "ar" ? zone.nameAr : zone.name}` : ""}
                        {" · "}
                        {formatDateTime(locale, inc.at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {inc.status === "open" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setStatus(inc.id, "ack")}
                        >
                          {t(locale, "incident.ack")}
                        </Button>
                      ) : null}
                      {inc.status !== "closed" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setStatus(inc.id, "closed")}
                        >
                          {t(locale, "incident.closed")}
                        </Button>
                      ) : null}
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
