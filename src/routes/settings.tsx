import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Download } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PpeIcon } from "@/components/ppe-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_CAMERA_RULES } from "@/lib/ppe/demo";
import { ppeLabel, t } from "@/lib/ppe/i18n";
import { PPE_CATALOG } from "@/lib/ppe/profiles";
import { rotateIngestKey, saveCameraRtsp, saveDetectorUrl, sendHourlyNow } from "@/lib/ppe/saas";
import { cameraRuleOf, usePpeStore } from "@/lib/ppe/store";
import type { PpeId } from "@/lib/ppe/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const locale = usePpeStore((s) => s.locale);
  const settings = usePpeStore((s) => s.settings);
  const setSettings = usePpeStore((s) => s.setSettings);
  const cameraRules = usePpeStore((s) => s.cameraRules);
  const setCameraEnabled = usePpeStore((s) => s.setCameraEnabled);
  const toggleCameraCheck = usePpeStore((s) => s.toggleCameraCheck);
  const setCameraChecks = usePpeStore((s) => s.setCameraChecks);
  const sites = usePpeStore((s) => s.sites);
  const cameras = usePpeStore((s) => s.cameras);
  const [detector, setDetector] = useState(settings.detectorUrl);
  const [ingestKey, setIngestKey] = useState("");
  const [rtspDraft, setRtspDraft] = useState<Record<string, string>>({});

  async function sendNow() {
    if (!settings.managerEmail.trim()) {
      toast.error(t(locale, "settings.emailMissing"));
      return;
    }
    const res = await sendHourlyNow().catch(() => ({ ok: false as const }));
    if (res.ok) {
      toast.success(t(locale, "settings.sentSmtp"));
      return;
    }
    toast.error(t(locale, "settings.smtpFail"));
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <p className="text-2xs uppercase tracking-widest text-subtle">
            {t(locale, "appName")}
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight">
            {t(locale, "settings.title")}
          </h1>
        </header>

        <section className="space-y-4">
          <div>
            <h2 className="text-base font-medium">{t(locale, "settings.cameras")}</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              {t(locale, "settings.camerasHint")}
            </p>
          </div>

          <div className="space-y-4">
            {cameras.map((cam) => {
              const rule = cameraRuleOf(cameraRules, cam.id);
              const site = sites.find((s) => s.id === cam.siteId);
              const defaults = DEFAULT_CAMERA_RULES[cam.id]?.checks ?? ["helmet"];
              return (
                <Card key={cam.id} className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                    <Link
                      to="/scan"
                      search={{ cam: cam.id }}
                      className="block w-full shrink-0 overflow-hidden rounded-lg lg:w-52"
                    >
                      <img
                        src={cam.image}
                        alt={locale === "ar" ? cam.nameAr : cam.name}
                        className="aspect-video w-full object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            {locale === "ar" ? cam.nameAr : cam.name}
                          </p>
                          <p className="text-xs text-muted">
                            {site ? (locale === "ar" ? site.nameAr : site.name) : ""}
                            {" · "}
                            {rule.checks.length}
                            {" "}
                            {t(locale, "settings.selected")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted">
                            {rule.enabled
                              ? t(locale, "settings.enabled")
                              : t(locale, "settings.disabled")}
                          </span>
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(v) => setCameraEnabled(cam.id, v)}
                            aria-label={t(locale, "settings.enabled")}
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!rule.enabled}
                          onClick={() => setCameraChecks(cam.id, [...PPE_CATALOG])}
                        >
                          {t(locale, "settings.all")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!rule.enabled}
                          onClick={() => setCameraChecks(cam.id, [])}
                        >
                          {t(locale, "settings.clear")}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={!rule.enabled}
                          onClick={() => setCameraChecks(cam.id, [...defaults])}
                        >
                          {t(locale, "settings.reset")}
                        </Button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                        {PPE_CATALOG.map((id) => {
                          const on = rule.checks.includes(id);
                          return (
                            <CheckCell
                              key={id}
                              id={id}
                              locale={locale}
                              on={on}
                              disabled={!rule.enabled}
                              onToggle={() => toggleCameraCheck(cam.id, id)}
                            />
                          );
                        })}
                      </div>
                      {rule.enabled && rule.checks.length === 0 ? (
                        <p className="mt-3 text-xs text-warn">
                          {locale === "ar"
                            ? "لا يوجد فحص مختار لهذه الكاميرا."
                            : "No checks selected for this camera."}
                        </p>
                      ) : null}
                      <div className="mt-4 space-y-1.5">
                        <Label htmlFor={`rtsp-${cam.id}`}>{t(locale, "settings.rtsp")}</Label>
                        <div className="flex gap-2">
                          <Input
                            id={`rtsp-${cam.id}`}
                            dir="ltr"
                            placeholder="rtsp://192.168.1.20/stream"
                            value={rtspDraft[cam.id] ?? rule.rtspUrl ?? ""}
                            onChange={(e) =>
                              setRtspDraft((d) => ({ ...d, [cam.id]: e.target.value }))
                            }
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              const url = (rtspDraft[cam.id] ?? rule.rtspUrl ?? "").trim();
                              void saveCameraRtsp({ data: { cameraId: cam.id, rtspUrl: url } })
                                .then(() => toast.success(t(locale, "settings.saveDetector")))
                                .catch(() => toast.error(t(locale, "login.failed")));
                            }}
                          >
                            {t(locale, "settings.saveDetector")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <Card className="space-y-5">
          <div>
            <h2 className="text-base font-medium">{t(locale, "settings.manager")}</h2>
            <p className="mt-1 text-sm text-muted">{t(locale, "settings.hourlyHint")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="mgr-name">{t(locale, "settings.managerName")}</Label>
              <Input
                id="mgr-name"
                value={settings.managerName}
                onChange={(e) => setSettings({ managerName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mgr-mail">{t(locale, "settings.managerEmail")}</Label>
              <Input
                id="mgr-mail"
                type="email"
                inputMode="email"
                placeholder="safety@plant.com"
                value={settings.managerEmail}
                onChange={(e) => setSettings({ managerEmail: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-elevated px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">{t(locale, "settings.hourly")}</p>
              <p className="text-xs text-muted">{t(locale, "reports.next")}</p>
            </div>
            <Switch
              checked={settings.hourlyEnabled}
              onCheckedChange={(v) => setSettings({ hourlyEnabled: v })}
              aria-label={t(locale, "settings.hourly")}
            />
          </div>
          <Button onClick={sendNow}>{t(locale, "reports.sendNow")}</Button>
        </Card>

        <Card className="space-y-4">
          <div>
            <h2 className="text-base font-medium">{t(locale, "settings.engine")}</h2>
            <p className="mt-2 text-sm text-muted">{t(locale, "settings.engineYolo")}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className={settings.mailReady ? "text-safe" : "text-muted"}>
                {settings.mailReady ? t(locale, "settings.mailOn") : t(locale, "settings.mailOff")}
              </span>
              <span className={settings.yoloReady ? "text-safe" : "text-muted"}>
                {settings.yoloReady ? t(locale, "settings.yoloOn") : t(locale, "settings.yoloOff")}
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="det">{t(locale, "settings.detector")}</Label>
            <div className="flex gap-2">
              <Input
                id="det"
                dir="ltr"
                placeholder="http://10.0.0.8:8090"
                value={detector}
                onChange={(e) => setDetector(e.target.value)}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  void saveDetectorUrl({ data: { detectorUrl: detector } }).then(() =>
                    toast.success(t(locale, "settings.saveDetector")),
                  )
                }
              >
                {t(locale, "settings.saveDetector")}
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t(locale, "settings.ingest")}</Label>
            <p className="text-xs text-muted">{t(locale, "settings.ingestHint")}</p>
            {ingestKey ? (
              <Input readOnly dir="ltr" value={ingestKey} />
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                void rotateIngestKey().then((r) => {
                  setIngestKey(r.key);
                  toast.success(t(locale, "settings.rotateKey"));
                })
              }
            >
              {t(locale, "settings.rotateKey")}
            </Button>
          </div>
          <div className="rounded-lg bg-elevated px-4 py-3">
            <p className="text-sm font-medium">{t(locale, "settings.factory")}</p>
            <p className="mt-1 text-sm text-muted">{t(locale, "settings.factoryHint")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild variant="secondary">
                <a href="/factory/aegis_ppe_detector.py" download>
                  <Download className="size-4" />
                  {t(locale, "settings.downloadPy")}
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/factory/requirements.txt" download>
                  <Download className="size-4" />
                  {t(locale, "settings.downloadReq")}
                </a>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function CheckCell({
  id,
  locale,
  on,
  disabled,
  onToggle,
}: {
  id: PpeId;
  locale: "ar" | "en";
  on: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      aria-pressed={on}
      className={cn(
        "flex min-h-11 items-center gap-2.5 rounded-md px-3 text-start text-xs transition-colors duration-150",
        on ? "bg-primary text-primary-fg" : "bg-elevated text-muted hover:text-fg",
        disabled && "opacity-40",
      )}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-xs",
          on ? "bg-primary-fg text-primary" : "bg-bg shadow-[var(--shadow-border)]",
        )}
      >
        {on ? <Check className="size-3" strokeWidth={2.5} /> : null}
      </span>
      <PpeIcon id={id} className="size-3.5 shrink-0" />
      <span className="truncate">{ppeLabel(locale, id)}</span>
    </button>
  );
}
