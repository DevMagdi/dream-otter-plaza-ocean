import { o as __toESM } from "../_runtime.mjs";
import { a as WEBCAM, h as ppeLabel, o as applyChecks, t as CAMERAS, u as cn, v as t } from "./plans-ByR_bG0u.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as createServerFn } from "./ssr.mjs";
import { Qt as string, Ut as array, Yt as object } from "../_libs/@better-auth/core+[...].mjs";
import { r as authMiddleware } from "./profiles-DeO1U3zD.mjs";
import { i as createSsrRpc, n as cameraRuleOf, u as usePpeStore } from "./use-current-user-B2nQN3IW.mjs";
import { t as Button } from "./button-Cdb7sc_1.mjs";
import { a as Square, f as LoaderCircle, l as Settings2, m as ImageUp, n as Video, u as ScanLine, w as Camera } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Card, t as AppShell } from "./card-DpPnLwzZ.mjs";
import { t as Badge } from "./badge-CzejCPnf.mjs";
import { t as RiskBadge } from "./risk-badge-SwIJGzoN.mjs";
import { n as Route } from "./router-EVAuR17A.mjs";
import { t as PpeIcon } from "./ppe-icon-q-tnEY-U.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scan-B8p6BAd0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DetectionOverlay({ persons, locale }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute inset-0",
		children: persons.map((p) => {
			const ok = p.compliant;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("absolute rounded-sm border-2", ok ? "border-safe" : "border-danger"),
				style: {
					left: `${p.bbox.x * 100}%`,
					top: `${p.bbox.y * 100}%`,
					width: `${p.bbox.w * 100}%`,
					height: `${p.bbox.h * 100}%`
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("absolute -top-6 start-0 max-w-[220px] truncate rounded-sm px-1.5 py-0.5 font-mono text-[10px] leading-tight", ok ? "bg-safe text-safe-fg" : "bg-danger text-danger-fg"),
					children: [p.id, !ok && p.missing.length ? ` · ${p.missing.map((m) => ppeLabel(locale, m)).join(" · ")}` : ""]
				})
			}, p.id);
		})
	});
}
function PersonPanel({ person, locale, required }) {
	const items = Array.from(/* @__PURE__ */ new Set([
		...required,
		...person.present,
		...person.missing
	]));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-elevated p-3 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-2 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xs text-muted",
				children: person.id
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				tone: person.compliant ? "safe" : "danger",
				children: person.compliant ? locale === "ar" ? "ملتزم" : "Compliant" : t(locale, "kpi.missing")
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-1.5",
			children: items.map((id) => {
				const ok = person.present.includes(id);
				const miss = person.missing.includes(id) || required.includes(id) && !ok;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-xs", miss ? "bg-danger-dim text-danger" : "bg-safe-dim text-safe"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PpeIcon, {
						id,
						className: "size-3.5"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: ppeLabel(locale, id) })]
				}, id);
			})
		})]
	});
}
var Input = object({
	imageDataUrl: string().min(32).max(16e5),
	required: array(string()).max(20),
	industry: string().max(40),
	zone: string().max(80)
});
var analyzePpe = createServerFn({ method: "POST" }).validator(Input).middleware([authMiddleware]).handler(createSsrRpc("56557fc54da8b440c55dec9dcda6ed230658e991d88446ea4e5d0e58ac866503"));
var MAX_EDGE = 960;
var JPEG_Q = .72;
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(/* @__PURE__ */ new Error("image load failed"));
		img.src = src;
	});
}
async function toCompressedDataUrl(src) {
	const img = await loadImage(src);
	const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
	const w = Math.max(1, Math.round(img.width * scale));
	const h = Math.max(1, Math.round(img.height * scale));
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("canvas");
	ctx.drawImage(img, 0, 0, w, h);
	return canvas.toDataURL("image/jpeg", JPEG_Q);
}
async function fileToDataUrl(file) {
	return toCompressedDataUrl(await new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(/* @__PURE__ */ new Error("read failed"));
		reader.readAsDataURL(file);
	}));
}
function captureVideoFrame(video) {
	const w = video.videoWidth || 640;
	const h = video.videoHeight || 360;
	const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
	const canvas = document.createElement("canvas");
	canvas.width = Math.max(1, Math.round(w * scale));
	canvas.height = Math.max(1, Math.round(h * scale));
	const ctx = canvas.getContext("2d");
	if (!ctx) return "";
	ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
	return canvas.toDataURL("image/jpeg", JPEG_Q);
}
function ScanPage() {
	const { cam: camId } = Route.useSearch();
	const locale = usePpeStore((s) => s.locale);
	const sites = usePpeStore((s) => s.sites);
	const recordAnalysis = usePpeStore((s) => s.recordAnalysis);
	const cameraRules = usePpeStore((s) => s.cameraRules);
	const [activeId, setActiveId] = (0, import_react.useState)(camId ?? "cam-gate");
	const [frame, setFrame] = (0, import_react.useState)(null);
	const [result, setResult] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [watching, setWatching] = (0, import_react.useState)(false);
	const [camError, setCamError] = (0, import_react.useState)(null);
	const videoRef = (0, import_react.useRef)(null);
	const streamRef = (0, import_react.useRef)(null);
	const fileRef = (0, import_react.useRef)(null);
	const lastCall = (0, import_react.useRef)(0);
	const watchCount = (0, import_react.useRef)(0);
	const isWebcam = activeId === "webcam";
	const sample = CAMERAS.find((c) => c.id === activeId) ?? CAMERAS[0];
	const camera = isWebcam ? {
		...WEBCAM,
		siteId: sample.siteId,
		zoneId: sample.zoneId
	} : sample;
	const site = sites.find((s) => s.id === camera.siteId) ?? sites[0];
	const zone = site.zones.find((z) => z.id === camera.zoneId) ?? site.zones[0];
	const rule = cameraRuleOf(cameraRules, camera.id);
	const required = rule.checks;
	const requiredKey = required.join(",");
	(0, import_react.useEffect)(() => {
		if (camId) setActiveId(camId);
	}, [camId]);
	(0, import_react.useEffect)(() => {
		if (isWebcam) return;
		setFrame(sample.image);
		setResult(sample.cached ? applyChecks(sample.cached, required) : null);
		setCamError(null);
		stopCam();
	}, [
		activeId,
		isWebcam,
		sample.id,
		requiredKey
	]);
	(0, import_react.useEffect)(() => {
		return () => stopCam();
	}, []);
	(0, import_react.useEffect)(() => {
		if (!watching) return;
		const id = window.setInterval(() => {
			runAnalyze("watch");
		}, 12e3);
		return () => window.clearInterval(id);
	}, [
		watching,
		activeId,
		frame
	]);
	function stopCam() {
		streamRef.current?.getTracks().forEach((tr) => tr.stop());
		streamRef.current = null;
		if (videoRef.current) videoRef.current.srcObject = null;
	}
	async function startCam() {
		setCamError(null);
		setActiveId("webcam");
		setResult(null);
		setFrame(null);
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: { ideal: "environment" },
					width: { ideal: 1280 }
				},
				audio: false
			});
			streamRef.current = stream;
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				await videoRef.current.play().catch(() => void 0);
			}
		} catch {
			setCamError(t(locale, "scan.noCam"));
		}
	}
	async function grabDataUrl() {
		if (isWebcam && videoRef.current && videoRef.current.readyState >= 2) return captureVideoFrame(videoRef.current);
		if (frame?.startsWith("data:")) return frame;
		if (frame) return toCompressedDataUrl(frame);
		return null;
	}
	async function runAnalyze(source = "ai") {
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
			const dataUrl = await grabDataUrl();
			if (!dataUrl) {
				toast.error(t(locale, "scan.empty"));
				return;
			}
			if (isWebcam) setFrame(dataUrl);
			const res = await analyzePpe({ data: {
				imageDataUrl: dataUrl,
				required,
				industry: site.industry,
				zone: locale === "ar" ? zone.nameAr : zone.name
			} });
			if (!res.ok) {
				toast.error(res.error === "unavailable" ? t(locale, "toast.aiOff") : t(locale, "toast.aiErr"));
				return;
			}
			const viewed = applyChecks(res.result, required);
			setResult(viewed);
			recordAnalysis({
				siteId: site.id,
				zoneId: zone.id,
				cameraId: camera.id,
				source: source === "watch" ? isWebcam ? "webcam" : "ai" : source,
				result: viewed
			});
			if (viewed.persons.filter((p) => !p.compliant).length) toast.error(`${t(locale, "toast.violation")} · ${locale === "ar" ? viewed.summaryAr : viewed.summary}`);
		} catch {
			toast.error(t(locale, "toast.aiErr"));
		} finally {
			setBusy(false);
		}
	}
	async function onUpload(file) {
		if (!file) return;
		try {
			const url = await fileToDataUrl(file);
			setActiveId(sample.id);
			stopCam();
			setFrame(url);
			setResult(null);
			setBusy(true);
			const res = await analyzePpe({ data: {
				imageDataUrl: url,
				required,
				industry: site.industry,
				zone: locale === "ar" ? zone.nameAr : zone.name
			} });
			if (!res.ok) {
				toast.error(res.error === "unavailable" ? t(locale, "toast.aiOff") : t(locale, "toast.aiErr"));
				return;
			}
			const viewed = applyChecks(res.result, required);
			setResult(viewed);
			recordAnalysis({
				siteId: site.id,
				zoneId: zone.id,
				cameraId: camera.id,
				source: "upload",
				result: viewed
			});
		} catch {
			toast.error(t(locale, "toast.aiErr"));
		} finally {
			setBusy(false);
		}
	}
	const persons = result?.persons ?? [];
	const viol = persons.filter((p) => !p.compliant).length;
	const feeds = (0, import_react.useMemo)(() => CAMERAS, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xs uppercase tracking-widest text-subtle",
						children: t(locale, "scan.title")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 text-3xl font-medium tracking-tight",
						children: locale === "ar" ? camera.nameAr : camera.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							locale === "ar" ? site.nameAr : site.name,
							" · ",
							locale === "ar" ? zone.nameAr : zone.name
						]
					})
				] }), result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskBadge, {
					risk: result.risk,
					locale
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "overflow-hidden p-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative aspect-video overflow-hidden rounded-lg bg-elevated",
							children: [
								isWebcam ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
									ref: videoRef,
									className: "size-full object-cover",
									playsInline: true,
									muted: true,
									autoPlay: true
								}) : frame ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: frame,
									alt: "",
									className: "size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex size-full items-center justify-center text-sm text-muted",
									children: t(locale, "scan.empty")
								}),
								result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetectionOverlay, {
									persons,
									locale
								}) : null,
								busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute inset-0 overflow-hidden bg-bg/30",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "scan-sweep absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-accent/25 to-transparent" })
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute start-2 top-2 flex gap-1.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										tone: rule.enabled ? "live" : "mute",
										className: "h-6 gap-1.5 px-2 text-2xs",
										children: [rule.enabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "live-dot size-1.5 rounded-full bg-danger" }) : null, isWebcam ? "CAM" : t(locale, "scan.sample")]
									})
								})
							]
						}),
						camError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 px-1 text-xs text-danger",
							children: camError
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: () => void runAnalyze(isWebcam ? "webcam" : "ai"),
									disabled: busy || !rule.enabled,
									children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { className: "size-4" }), busy ? t(locale, "scan.analyzing") : t(locale, "scan.analyze")]
								}),
								isWebcam ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									onClick: stopCam,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-4" }), t(locale, "scan.stopCam")]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									onClick: () => void startCam(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-4" }), t(locale, "scan.startCam")]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									onClick: () => fileRef.current?.click(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUp, { className: "size-4" }), t(locale, "scan.upload")]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: watching ? "danger" : "ghost",
									onClick: () => {
										watchCount.current = 0;
										setWatching((w) => !w);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-4" }), watching ? t(locale, "scan.stopWatch") : t(locale, "scan.watch")]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: fileRef,
									type: "file",
									accept: "image/jpeg,image/png,image/webp",
									className: "hidden",
									onChange: (e) => void onUpload(e.target.files?.[0])
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: t(locale, "scan.required")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/settings",
							className: "inline-flex items-center gap-1 text-xs text-muted hover:text-fg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-3.5" }), t(locale, "scan.configure")]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-1.5",
						children: required.length ? required.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "mute",
							children: ppeLabel(locale, id)
						}, id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-warn",
							children: locale === "ar" ? "لا يوجد فحص مختار." : "No checks selected."
						})
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: t(locale, "scan.result")
							}), result ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: cn("font-mono text-xs tabular", viol ? "text-danger" : "text-safe"),
								children: [
									persons.length - viol,
									"/",
									persons.length || 0
								]
							}) : null]
						}),
						result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 text-sm text-muted",
							children: locale === "ar" ? result.summaryAr : result.summary
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-subtle",
							children: t(locale, "scan.empty")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: persons.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonPanel, {
								person: p,
								locale,
								required
							}, p.id))
						})
					] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-2 sm:grid-cols-6",
				children: feeds.map((cam) => {
					const on = cam.id === activeId;
					const r = cameraRuleOf(cameraRules, cam.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setActiveId(cam.id),
						className: cn("overflow-hidden rounded-lg text-start shadow-[var(--shadow-border)] transition-shadow duration-150", on ? "ring-1 ring-accent/50" : "", !r.enabled && "opacity-50"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: cam.image,
							alt: locale === "ar" ? cam.nameAr : cam.name,
							className: "aspect-video w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate px-2 py-1.5 text-2xs text-muted",
							children: locale === "ar" ? cam.nameAr : cam.name
						})]
					}, cam.id);
				})
			})
		]
	}) });
}
//#endregion
export { ScanPage as component };
