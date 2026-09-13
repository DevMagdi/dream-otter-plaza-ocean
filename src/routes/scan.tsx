import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Camera,
  ImageUp,
  LoaderCircle,
  ScanLine,
  Settings2,
  Square,
  Video,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { DetectionOverlay } from "@/components/detection-overlay";
import { PersonPanel } from "@/components/person-panel";
import { RiskBadge } from "@/components/risk-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { analyzePpe } from "@/lib/ppe/analyze";
import { applyChecks } from "@/lib/ppe/checks";
import { WEBCAM } from "@/lib/ppe/demo";
import { captureVideoFrame, fileToDataUrl, toCompressedDataUrl } from "@/lib/ppe/image";
import { ppeLabel, t } from "@/lib/ppe/i18n";
import { failClosedResult, offlineSampleResult } from "@/lib/ppe/offline";
import { cameraRuleOf, usePpeStore } from "@/lib/ppe/store";
import type { AnalysisResult, CameraFeed } from "@/lib/ppe/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/scan")({
  validateSearch: (search: Record<string, unknown>): { cam?: string } => ({
    cam: typeof search.cam === "string" ? search.cam : undefined,
  }),
  component: ScanPage,
});

function ScanPage() {
  const { cam: camId } = Route.useSearch();
  const locale = usePpeStore((s) => s.locale);
  const sites = usePpeStore((s) => s.sites);
  const cameras = usePpeStore((s) => s.cameras);
  const recordAnalysis = usePpeStore((s) => s.recordAnalysis);
  const cameraRules = usePpeStore((s) => s.cameraRules);

  const [activeId, setActiveId] = useState(camId ?? "cam-gate");
  const [frame, setFrame] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [watching, setWatching] = useState(false);
  const [liveOn, setLiveOn] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const lastCall = useRef(0);
  const watchCount = useRef(0);

  const isWebcam = activeId === "webcam";
  const sample = cameras.find((c) => c.id === activeId) ?? cameras[0] ?? {
    ...WEBCAM,
    siteId: sites[0]?.id ?? "site",
    zoneId: sites[0]?.zones[0]?.id ?? "zone",
  };
  const camera: CameraFeed = isWebcam
    ? { ...WEBCAM, siteId: sample.siteId, zoneId: sample.zoneId }
    : sample;

  const site = sites.find((s) => s.id === camera.siteId) ?? sites[0];
  const zone = site?.zones.find((z) => z.id === camera.zoneId) ?? site?.zones[0];
  const rule = cameraRuleOf(cameraRules, camera.id);
  const required = rule.checks.length ? rule.checks : zone?.required ?? ["helmet"];
  const requiredKey = required.join(",");

  useEffect(() => {
    if (camId) setActiveId(camId);
  }, [camId]);

  useEffect(() => {
    if (isWebcam) return;
    setFrame(sample.image);
    setResult(sample.cached ? applyChecks(sample.cached, required) : null);
    setCamError(null);
    stopCam();
  }, [activeId, isWebcam, sample.id, requiredKey]);

  useEffect(() => {
    return () => stopCam();
  }, []);

  useEffect(() => {
    if (!watching) return;
    const id = window.setInterval(() => {
      void runAnalyze("watch");
    }, 12000);
    return () => window.clearInterval(id);
  }, [watching, activeId, frame]);

  function stopCam() {
    if (videoRef.current && videoRef.current.readyState >= 2) {
      try {
        const shot = captureVideoFrame(videoRef.current);
        if (shot) setFrame(shot);
      } catch {
        /* keep last frame */
      }
    }
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setLiveOn(false);
    setWatching(false);
  }

  async function startCam() {
    setCamError(null);
    setActiveId("webcam");
    setResult(null);
    setFrame(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setLiveOn(true);
    } catch {
      setLiveOn(false);
      setCamError(t(locale, "scan.noCam"));
    }
  }

  async function grabDataUrl(): Promise<string | null> {
    if (isWebcam && videoRef.current && videoRef.current.readyState >= 2) {
      return captureVideoFrame(videoRef.current);
    }
    if (frame?.startsWith("data:")) return frame;
    if (frame) return toCompressedDataUrl(frame);
    return null;
  }

  async function runAnalyze(source: "ai" | "webcam" | "upload" | "watch" = "ai") {
    if (busy) return;
    const now = Date.now();
    if (now - lastCall.current < 3500) return;
    if (source === "watch") {
      watchCount.current += 1;
      if (watchCount.current > 12) {
        setWatching(false);
        return;
      }
    }
    setBusy(true);
    lastCall.current = now;
    try {
      const local = !isWebcam ? offlineSampleResult(camera.id, required) : null;
      if (local && source !== "upload") {
        setResult(local);
        recordAnalysis({
          siteId: site?.id ?? "",
          zoneId: zone?.id ?? "",
          cameraId: camera.id,
          source: "sample",
          result: local,
        });
        const violators = local.persons.filter((p) => !p.compliant);
        if (violators.length) {
          toast.error(
            `${t(locale, "toast.violation")} · ${locale === "ar" ? local.summaryAr : local.summary}`,
          );
        } else {
          toast.success(t(locale, "toast.saved"));
        }
        return;
      }
      const dataUrl = await grabDataUrl();
      if (!dataUrl) {
        toast.error(t(locale, "scan.empty"));
        return;
      }
      if (isWebcam) setFrame(dataUrl);
      const res = await analyzePpe({
        data: {
          imageDataUrl: dataUrl,
          required,
          industry: site?.industry ?? "manufacturing",
          zone: locale === "ar" ? zone?.nameAr ?? "" : zone?.name ?? "",
          cameraId: camera.id,
        },
      });
      const viewed = res.ok
        ? applyChecks(res.result, required)
        : offlineSampleResult(camera.id, required) ?? failClosedResult(required);
      setResult(viewed);
      recordAnalysis({
        siteId: site.id,
        zoneId: zone.id,
        cameraId: camera.id,
        source: source === "watch" ? (isWebcam ? "webcam" : "ai") : source === "ai" ? "ai" : source,
        result: viewed,
      });
      const violators = viewed.persons.filter((p) => !p.compliant);
      if (violators.length) {
        toast.error(
          `${t(locale, "toast.violation")} · ${locale === "ar" ? viewed.summaryAr : viewed.summary}`,
        );
      }
    } catch {
      const viewed = offlineSampleResult(camera.id, required) ?? failClosedResult(required);
      setResult(viewed);
      toast.error(t(locale, "toast.aiErr"));
    } finally {
      setBusy(false);
    }
  }

  async function onUpload(file: File | undefined) {
    if (!file) return;
    try {
      const url = await fileToDataUrl(file);
      setActiveId(sample.id);
      stopCam();
      setFrame(url);
      setResult(null);
      setBusy(true);
      const res = await analyzePpe({
        data: {
          imageDataUrl: url,
          required,
          industry: site?.industry ?? "manufacturing",
          zone: locale === "ar" ? zone?.nameAr ?? "" : zone?.name ?? "",
          cameraId: "upload",
        },
      });
      const viewed = res.ok
        ? applyChecks(res.result, required)
        : failClosedResult(required);
      setResult(viewed);
      recordAnalysis({
        siteId: site.id,
        zoneId: zone.id,
        cameraId: camera.id,
        source: "upload",
        result: viewed,
      });
    } catch {
      setResult(failClosedResult(required));
      toast.error(t(locale, "toast.aiErr"));
    } finally {
      setBusy(false);
    }
  }

  const persons = result?.persons ?? [];
  const viol = persons.filter((p) => !p.compliant).length;
  const feeds = cameras;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-2xs uppercase tracking-widest text-subtle">
              {t(locale, "scan.title")}
            </p>
            <h1 className="mt-2 text-3xl font-medium tracking-tight">
              {locale === "ar" ? camera.nameAr : camera.name}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {locale === "ar" ? site?.nameAr : site?.name}
              {" · "}
              {locale === "ar" ? zone?.nameAr : zone?.name}
            </p>
          </div>
          {result ? <RiskBadge risk={result.risk} locale={locale} /> : null}
        </header>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Card className="overflow-hidden p-2">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-elevated">
              <video
                ref={videoRef}
                className={cn("size-full object-cover", liveOn ? "block" : "hidden")}
                playsInline
                muted
                autoPlay
              />
              {!liveOn && frame ? (
                <img
                  src={frame}
                  alt=""
                  className="size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
                />
              ) : null}
              {!liveOn && !frame ? (
                <div className="flex size-full items-center justify-center text-sm text-muted">
                  {t(locale, "scan.empty")}
                </div>
              ) : null}
              {result ? <DetectionOverlay persons={persons} locale={locale} /> : null}
              {busy ? (
                <div className="absolute inset-0 overflow-hidden bg-bg/30">
                  <div className="scan-sweep absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-accent/25 to-transparent" />
                </div>
              ) : null}
              <div className="absolute start-2 top-2 flex gap-1.5">
                <Badge tone={rule.enabled ? "live" : "mute"} className="h-6 gap-1.5 px-2 text-2xs">
                  {rule.enabled ? <span className="live-dot size-1.5 rounded-full bg-danger" /> : null}
                  {isWebcam ? "CAM" : t(locale, "scan.sample")}
                </Badge>
              </div>
            </div>

            {camError ? (
              <p className="mt-2 px-1 text-xs text-danger">{camError}</p>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                onClick={() => void runAnalyze(isWebcam ? "webcam" : "ai")}
                disabled={busy || !rule.enabled}
              >
                {busy ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <ScanLine className="size-4" />
                )}
                {busy ? t(locale, "scan.analyzing") : t(locale, "scan.analyze")}
              </Button>
              {liveOn ? (
                <Button variant="secondary" onClick={stopCam}>
                  <Square className="size-4" />
                  {t(locale, "scan.stopCam")}
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => void startCam()}>
                  <Video className="size-4" />
                  {t(locale, "scan.startCam")}
                </Button>
              )}
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <ImageUp className="size-4" />
                {t(locale, "scan.upload")}
              </Button>
              <Button
                variant={watching ? "danger" : "ghost"}
                onClick={() => {
                  watchCount.current = 0;
                  setWatching((w) => !w);
                }}
              >
                <Camera className="size-4" />
                {watching ? t(locale, "scan.stopWatch") : t(locale, "scan.watch")}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => void onUpload(e.target.files?.[0])}
              />
            </div>
          </Card>

          <div className="space-y-3">
            <Card>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs text-muted">{t(locale, "scan.required")}</p>
                <Link to="/settings" className="inline-flex items-center gap-1 text-xs text-muted hover:text-fg">
                  <Settings2 className="size-3.5" />
                  {t(locale, "scan.configure")}
                </Link>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {required.length ? (
                  required.map((id) => (
                    <Badge key={id} tone="mute">
                      {ppeLabel(locale, id)}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-warn">
                    {locale === "ar" ? "لا يوجد فحص مختار." : "No checks selected."}
                  </p>
                )}
              </div>
            </Card>
            <Card>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">{t(locale, "scan.result")}</p>
                {result ? (
                  <span
                    className={cn(
                      "font-mono text-xs tabular",
                      viol ? "text-danger" : "text-safe",
                    )}
                  >
                    {persons.length - viol}/{persons.length || 0}
                  </span>
                ) : null}
              </div>
              {result ? (
                <p className="mb-3 text-sm text-muted">
                  {locale === "ar" ? result.summaryAr : result.summary}
                </p>
              ) : (
                <p className="text-sm text-subtle">{t(locale, "scan.empty")}</p>
              )}
              <div className="space-y-2">
                {persons.map((p) => (
                  <PersonPanel
                    key={p.id}
                    person={p}
                    locale={locale}
                    required={required}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {feeds.map((cam) => {
            const on = cam.id === activeId;
            const r = cameraRuleOf(cameraRules, cam.id);
            return (
              <button
                key={cam.id}
                type="button"
                onClick={() => setActiveId(cam.id)}
                className={cn(
                  "overflow-hidden rounded-lg text-start shadow-[var(--shadow-border)] transition-shadow duration-150",
                  on ? "ring-1 ring-accent/50" : "",
                  !r.enabled && "opacity-50",
                )}
              >
                <img
                  src={cam.image}
                  alt={locale === "ar" ? cam.nameAr : cam.name}
                  className="aspect-video w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
                />
                <span className="block truncate px-2 py-1.5 text-2xs text-muted">
                  {locale === "ar" ? cam.nameAr : cam.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
