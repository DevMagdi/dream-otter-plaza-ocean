import { o as __toESM } from "../_runtime.mjs";
import { f as formatRelative, h as ppeLabel, o as applyChecks, p as industryLabel, t as CAMERAS, u as cn, v as t } from "./plans-ByR_bG0u.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as cameraRuleOf, u as usePpeStore } from "./use-current-user-B2nQN3IW.mjs";
import { T as ArrowUpRight, d as Mail, w as Camera } from "../_libs/lucide-react.mjs";
import { n as Card, t as AppShell } from "./card-DpPnLwzZ.mjs";
import { t as Badge } from "./badge-CzejCPnf.mjs";
import { t as RiskBadge } from "./risk-badge-SwIJGzoN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DSV-SBof.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ComplianceRing({ value, label }) {
	const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
	const r = 42;
	const c = 2 * Math.PI * r;
	const dash = pct / 100 * c;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mx-auto size-36",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 100 100",
			className: "size-full -rotate-90",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "50",
				cy: "50",
				r,
				fill: "none",
				stroke: "var(--color-elevated)",
				strokeWidth: "8"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "50",
				cy: "50",
				r,
				fill: "none",
				stroke: pct >= 85 ? "var(--color-safe)" : pct >= 60 ? "var(--color-warn)" : "var(--color-danger)",
				strokeWidth: "8",
				strokeLinecap: "round",
				strokeDasharray: `${dash} ${c - dash}`
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute inset-0 flex flex-col items-center justify-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-mono text-3xl font-medium tabular",
				children: [pct, "%"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted",
				children: label
			})]
		})]
	});
}
function useNow(intervalMs = 3e4) {
	const [now, setNow] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setNow(Date.now());
		const id = window.setInterval(() => setNow(Date.now()), intervalMs);
		return () => window.clearInterval(id);
	}, [intervalMs]);
	return now;
}
function Home() {
	const locale = usePpeStore((s) => s.locale);
	if (usePpeStore((s) => s.role) === "platform") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/platform" });
	const sites = usePpeStore((s) => s.sites);
	const incidents = usePpeStore((s) => s.incidents);
	const scans = usePpeStore((s) => s.scans);
	const cameraRules = usePpeStore((s) => s.cameraRules);
	const settings = usePpeStore((s) => s.settings);
	const briefs = usePpeStore((s) => s.briefs);
	const clock = useNow();
	const startOfDay = /* @__PURE__ */ new Date();
	startOfDay.setHours(0, 0, 0, 0);
	const todayScans = scans.filter((s) => s.at >= startOfDay.getTime());
	const open = incidents.filter((i) => i.status === "open");
	const recent = [...incidents].sort((a, b) => b.at - a.at).slice(0, 5);
	const latestBrief = briefs[0];
	const persons = todayScans.reduce((n, s) => n + s.persons, 0) || scans.slice(0, 8).reduce((n, s) => n + s.persons, 0);
	const viol = todayScans.reduce((n, s) => n + s.violations, 0) || scans.slice(0, 8).reduce((n, s) => n + s.violations, 0);
	const compliance = persons ? (persons - viol) / persons : .82;
	const nextIn = clock ? Math.max(0, settings.lastBriefAt + 36e5 - clock) : 0;
	const nextMin = Math.ceil(nextIn / 6e4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "enter-up flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-2xs uppercase tracking-widest text-subtle",
					children: t(locale, "appName")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-3xl font-medium tracking-tight",
					children: t(locale, "nav.dashboard")
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					tone: "live",
					className: "h-8 gap-2 px-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "live-dot size-1.5 rounded-full bg-danger" }), "LIVE"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "flex flex-col items-center justify-center gap-4 py-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComplianceRing, {
						value: compliance,
						label: t(locale, "kpi.compliance")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-sm text-muted",
						children: locale === "ar" ? "حسب فحوصات الكاميرات المفعّلة" : "Against enabled camera checks"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
							label: t(locale, "kpi.open"),
							value: open.length,
							hint: locale === "ar" ? "تحتاج إجراء" : "Need action",
							danger: open.length > 0
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
							label: t(locale, "kpi.scans"),
							value: todayScans.length || scans.length,
							hint: locale === "ar" ? "إطارات اليوم" : "Frames today"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
							label: t(locale, "kpi.cameras"),
							value: CAMERAS.filter((c) => cameraRuleOf(cameraRules, c.id).enabled).length,
							hint: locale === "ar" ? "كاميرات مفعّلة" : "Enabled cameras"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "sm:col-span-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: t(locale, "reports.hourly")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm",
										children: clock ? locale === "ar" ? `التالي خلال ${nextMin} د · ${settings.managerName}` : `Next in ${nextMin}m · ${settings.managerName}` : settings.managerName
									}),
									latestBrief ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-xs text-subtle",
										children: [
											latestBrief.violationCount,
											" ",
											locale === "ar" ? "مخالفة في آخر تقرير" : "in last brief"
										]
									}) : null
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/reports",
									className: "inline-flex h-11 items-center gap-2 rounded-md bg-elevated px-3 text-sm text-fg",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-4" }), t(locale, "reports.send")]
								})]
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-medium",
					children: locale === "ar" ? "الكاميرات" : "Cameras"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/scan",
					className: "inline-flex items-center gap-1 text-sm text-muted hover:text-fg",
					children: [t(locale, "nav.scan"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-3.5" })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: CAMERAS.map((cam) => {
					const site = sites.find((s) => s.id === cam.siteId);
					const rule = cameraRuleOf(cameraRules, cam.id);
					const violators = (cam.cached ? applyChecks(cam.cached, rule.checks) : null)?.persons.filter((p) => !p.compliant).length ?? 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/scan",
						search: { cam: cam.id },
						className: "group overflow-hidden rounded-xl bg-surface p-1.5 shadow-[var(--shadow-border)] transition-shadow duration-150 hover:shadow-[var(--shadow-border-hover)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative aspect-video overflow-hidden rounded-lg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: cam.image,
								alt: locale === "ar" ? cam.nameAr : cam.name,
								className: "size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10 transition-transform duration-300 group-hover:scale-[1.03]"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute start-2 top-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									tone: rule.enabled ? "live" : "mute",
									className: "h-6 gap-1.5 px-2 text-2xs",
									children: [rule.enabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "live-dot size-1.5 rounded-full bg-danger" }) : null, rule.enabled ? "LIVE" : t(locale, "settings.disabled")]
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-2.5 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate text-sm font-medium",
										children: locale === "ar" ? cam.nameAr : cam.name
									}), rule.enabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("font-mono text-xs tabular", violators ? "text-danger" : "text-safe"),
										children: violators ? violators : "OK"
									}) : null]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs text-muted",
									children: site ? locale === "ar" ? site.nameAr : site.name : ""
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex flex-wrap gap-1",
									children: rule.checks.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full bg-elevated px-2 py-0.5 text-2xs text-muted",
										children: ppeLabel(locale, id)
									}, id))
								})
							]
						})]
					}, cam.id);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 lg:grid-cols-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-4 text-base font-medium",
						children: locale === "ar" ? "آخر المخالفات" : "Latest incidents"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-border",
						children: recent.map((inc) => {
							const site = sites.find((s) => s.id === inc.siteId);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-3 py-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("size-2 shrink-0 rounded-full", inc.status === "open" ? "bg-danger" : "bg-muted") }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-sm",
											children: inc.missing.map((m) => ppeLabel(locale, m)).join(" · ")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "truncate text-xs text-muted",
											children: [
												site ? locale === "ar" ? site.nameAr : site.name : "",
												" · ",
												clock ? formatRelative(locale, inc.at) : "—"
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskBadge, {
										risk: inc.risk,
										locale
									})
								]
							}, inc.id);
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-4 text-base font-medium",
							children: locale === "ar" ? "المواقع" : "Sites"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2",
							children: sites.map((site) => {
								const openN = incidents.filter((i) => i.siteId === site.id).filter((i) => i.status === "open").length;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center justify-between rounded-lg bg-elevated px-3 py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-sm",
											children: locale === "ar" ? site.nameAr : site.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted",
											children: industryLabel(locale, site.industry)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("font-mono text-xs tabular", openN ? "text-danger" : "text-safe"),
										children: openN
									})]
								}, site.id);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/scan",
							className: "mt-5 flex h-11 items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-fg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-4" }), t(locale, "nav.scan")]
						})
					]
				})]
			})
		]
	}) });
}
function Kpi({ label, value, hint, danger }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: label
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("mt-3 font-mono text-3xl font-medium tabular", danger ? "text-danger" : "text-fg"),
			children: value
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-subtle",
			children: hint
		})
	] });
}
//#endregion
export { Home as component };
