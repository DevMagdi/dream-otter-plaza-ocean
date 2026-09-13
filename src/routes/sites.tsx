import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PpeIcon } from "@/components/ppe-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { industryLabel, ppeLabel, t } from "@/lib/ppe/i18n";
import { INDUSTRIES, PPE_CATALOG, defaultRequired } from "@/lib/ppe/profiles";
import { usePpeStore } from "@/lib/ppe/store";
import type { IndustryId, PpeId, Site } from "@/lib/ppe/types";
import { cn, uid } from "@/lib/utils";

export const Route = createFileRoute("/sites")({ component: SitesPage });

const INDUSTRY_IDS = Object.keys(INDUSTRIES) as IndustryId[];

function SitesPage() {
  const locale = usePpeStore((s) => s.locale);
  const sites = usePpeStore((s) => s.sites);
  const activeSiteId = usePpeStore((s) => s.activeSiteId);
  const setActiveSite = usePpeStore((s) => s.setActiveSite);
  const upsertSite = usePpeStore((s) => s.upsertSite);
  const addCamera = usePpeStore((s) => s.addCamera);
  const cameras = usePpeStore((s) => s.cameras);
  const [adding, setAdding] = useState(false);
  const [addingCam, setAddingCam] = useState(false);

  const active = sites.find((s) => s.id === activeSiteId) ?? sites[0];

  function togglePpe(zoneId: string, id: PpeId) {
    const next: Site = {
      ...active,
      zones: active.zones.map((z) =>
        z.id !== zoneId
          ? z
          : {
              ...z,
              required: z.required.includes(id)
                ? z.required.filter((x) => x !== id)
                : [...z.required, id],
            },
      ),
    };
    upsertSite(next);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-subtle">
              {t(locale, "sites.industry")}
            </p>
            <h1 className="mt-1 text-2xl font-medium tracking-tight">
              {t(locale, "sites.title")}
            </h1>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setAdding((v) => !v)}>
            {t(locale, "sites.add")}
          </Button>
        </header>

        {adding ? (
          <AddSite
            locale={locale}
            onCreate={(site) => {
              upsertSite(site);
              setActiveSite(site.id);
              setAdding(false);
              toast.success(t(locale, "toast.saved"));
            }}
          />
        ) : null}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {sites.map((site) => (
            <button
              key={site.id}
              type="button"
              onClick={() => setActiveSite(site.id)}
              className={cn(
                "h-11 shrink-0 rounded-full px-4 text-sm",
                site.id === active.id
                  ? "bg-primary text-primary-fg"
                  : "bg-elevated text-muted",
              )}
            >
              {locale === "ar" ? site.nameAr : site.name}
            </button>
          ))}
        </div>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">
                {locale === "ar" ? active.nameAr : active.name}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {locale === "ar" ? active.cityAr : active.city}
                {" · "}
                {industryLabel(locale, active.industry)}
              </p>
            </div>
            <Badge tone="mute">{active.zones.length} {t(locale, "sites.zones")}</Badge>
          </div>
        </Card>

        <div className="grid gap-3">
          {active.zones.map((zone) => (
            <Card key={zone.id}>
              <h3 className="text-sm font-medium">
                {locale === "ar" ? zone.nameAr : zone.name}
              </h3>
              <p className="mt-1 text-xs text-muted">{t(locale, "sites.required")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PPE_CATALOG.map((id) => {
                  const on = zone.required.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => togglePpe(zone.id, id)}
                      className={cn(
                        "flex h-11 items-center gap-2 rounded-full px-3 text-xs",
                        on ? "bg-safe-dim text-safe" : "bg-elevated text-muted",
                      )}
                    >
                      <PpeIcon id={id} className="size-3.5" />
                      {ppeLabel(locale, id)}
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">{t(locale, "kpi.cameras")}</h2>
            <Button variant="secondary" size="sm" onClick={() => setAddingCam((v) => !v)}>
              {t(locale, "cameras.add")}
            </Button>
          </div>
          {cameras.filter((c) => c.siteId === active.id).map((cam) => (
            <p key={cam.id} className="text-sm text-muted">
              {locale === "ar" ? cam.nameAr : cam.name}
              {cam.rtspUrl ? ` · ${cam.rtspUrl}` : ""}
            </p>
          ))}
          {addingCam ? (
            <AddCamera
              locale={locale}
              site={active}
              onCreate={async (payload) => {
                const id = await addCamera(payload);
                if (id) {
                  toast.success(t(locale, "toast.saved"));
                  setAddingCam(false);
                } else {
                  toast.error(t(locale, "toast.aiErr"));
                }
              }}
            />
          ) : null}
        </Card>
      </div>
    </AppShell>
  );
}

function AddSite({
  locale,
  onCreate,
}: {
  locale: "ar" | "en";
  onCreate: (site: Site) => void;
}) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState<IndustryId>("manufacturing");

  return (
    <Card className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t(locale, "sites.name")}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>{t(locale, "sites.city")}</Label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>{t(locale, "sites.industry")}</Label>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value as IndustryId)}
          className="h-11 w-full rounded-md bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)]"
        >
          {INDUSTRY_IDS.map((id) => (
            <option key={id} value={id}>
              {industryLabel(locale, id)}
            </option>
          ))}
        </select>
      </div>
      <Button
        onClick={() => {
          if (!name.trim()) return;
          const id = uid("site");
          onCreate({
            id,
            name: name.trim(),
            nameAr: name.trim(),
            industry,
            city: city.trim() || "—",
            cityAr: city.trim() || "—",
            zones: [
              {
                id: uid("zone"),
                name: "Main floor",
                nameAr: "الأرضية الرئيسية",
                required: defaultRequired(industry),
              },
            ],
          });
        }}
      >
        {t(locale, "sites.save")}
      </Button>
    </Card>
  );
}

function AddCamera({
  locale,
  site,
  onCreate,
}: {
  locale: "ar" | "en";
  site: Site;
  onCreate: (input: {
    name: string;
    siteId: string;
    zoneId: string;
    rtspUrl?: string;
    checks?: PpeId[];
  }) => void;
}) {
  const [name, setName] = useState("");
  const [rtsp, setRtsp] = useState("");
  const zoneId = site.zones[0]?.id ?? "";
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label>{t(locale, "cameras.name")}</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>{t(locale, "cameras.rtsp")}</Label>
        <Input value={rtsp} onChange={(e) => setRtsp(e.target.value)} placeholder="rtsp://192.168.1.20/stream" />
      </div>
      <Button
        className="sm:col-span-2"
        onClick={() => {
          if (!name.trim() || !zoneId) return;
          onCreate({
            name: name.trim(),
            siteId: site.id,
            zoneId,
            rtspUrl: rtsp.trim() || undefined,
            checks: site.zones[0]?.required ?? ["helmet"],
          });
        }}
      >
        {t(locale, "sites.save")}
      </Button>
    </div>
  );
}
