import { c as briefSubject, d as formatDateTime, h as ppeLabel, m as mailtoHref, s as briefBody, t as CAMERAS, v as t } from "./plans-ByR_bG0u.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as PPE_CATALOG } from "./profiles-DeO1U3zD.mjs";
import { u as usePpeStore } from "./use-current-user-B2nQN3IW.mjs";
import { t as Button } from "./button-Cdb7sc_1.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Card, t as AppShell } from "./card-DpPnLwzZ.mjs";
import { t as Badge } from "./badge-CzejCPnf.mjs";
import { a as Bar, i as CartesianGrid, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-mesce-lE.js
var import_jsx_runtime = require_jsx_runtime();
function ReportsPage() {
	const locale = usePpeStore((s) => s.locale);
	const incidents = usePpeStore((s) => s.incidents);
	const sites = usePpeStore((s) => s.sites);
	const scans = usePpeStore((s) => s.scans);
	const briefs = usePpeStore((s) => s.briefs);
	const settings = usePpeStore((s) => s.settings);
	const generateBrief = usePpeStore((s) => s.generateBrief);
	const markBriefSent = usePpeStore((s) => s.markBriefSent);
	const hours = Array.from({ length: 12 }, (_, i) => {
		const d = /* @__PURE__ */ new Date();
		d.setMinutes(0, 0, 0);
		d.setHours(d.getHours() - (11 - i));
		const start = d.getTime();
		const end = start + 36e5;
		const count = incidents.filter((x) => x.at >= start && x.at < end).length;
		return {
			label: new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { hour: "2-digit" }).format(d),
			count
		};
	});
	const byPpe = PPE_CATALOG.map((id) => ({
		id,
		name: ppeLabel(locale, id),
		count: incidents.filter((i) => i.missing.includes(id)).length
	})).filter((r) => r.count > 0).sort((a, b) => b.count - a.count);
	const bySite = sites.map((site) => {
		const related = scans.filter((s) => s.siteId === site.id);
		const persons = related.reduce((n, s) => n + s.persons, 0);
		const viol = related.reduce((n, s) => n + s.violations, 0);
		const pct = persons ? Math.round((persons - viol) / persons * 100) : 100;
		return {
			name: locale === "ar" ? site.nameAr : site.name,
			pct
		};
	});
	function sendBrief(id) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-2xs uppercase tracking-widest text-subtle",
					children: "HSE"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-3xl font-medium tracking-tight",
					children: t(locale, "reports.title")
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => {
						generateBrief();
						toast.success(t(locale, "toast.briefReady"));
					},
					children: t(locale, "reports.sendNow")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-4 text-base font-medium",
				children: t(locale, "reports.hourly")
			}), briefs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: t(locale, "reports.emptyHour")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-3",
				children: briefs.slice(0, 6).map((brief) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-lg bg-elevated px-3 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: brief.status === "sent" ? "safe" : "warn",
										children: t(locale, `reports.${brief.status}`)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-xs text-muted tabular",
										children: formatDateTime(locale, brief.from)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm",
									children: brief.violationCount ? locale === "ar" ? `${brief.violationCount} مخالفة` : `${brief.violationCount} violation(s)` : t(locale, "reports.emptyHour")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 space-y-1",
									children: brief.people.slice(0, 4).map((p, i) => {
										const cam = CAMERAS.find((c) => c.id === p.cameraId);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
											className: "truncate text-xs text-muted",
											children: (cam ? locale === "ar" ? cam.nameAr : cam.name : p.cameraId) + " · " + p.personId + " · " + p.missing.map((m) => ppeLabel(locale, m)).join(", ")
										}, `${brief.id}-${i}`);
									})
								})
							]
						}), brief.status === "ready" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: () => sendBrief(brief.id),
							children: t(locale, "reports.send")
						}) : null]
					})
				}, brief.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "h-72",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 text-sm font-medium",
					children: t(locale, "reports.byHour")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "85%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: hours,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								stroke: "var(--color-border)",
								vertical: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "label",
								tick: {
									fill: "var(--color-muted)",
									fontSize: 11
								},
								axisLine: false,
								tickLine: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								allowDecimals: false,
								tick: {
									fill: "var(--color-muted)",
									fontSize: 11
								},
								axisLine: false,
								tickLine: false,
								width: 28
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								cursor: { fill: "var(--color-elevated)" },
								contentStyle: {
									background: "var(--color-surface)",
									border: "1px solid var(--color-border)",
									borderRadius: 8,
									color: "var(--color-fg)"
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "count",
								fill: "var(--color-danger)",
								radius: [
									4,
									4,
									0,
									0
								]
							})
						]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 text-sm font-medium",
					children: t(locale, "reports.byPpe")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: byPpe.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-28 shrink-0 truncate text-sm",
								children: row.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-2 flex-1 overflow-hidden rounded-full bg-elevated",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full rounded-full bg-danger",
									style: { width: `${Math.min(100, row.count * 12)}%` }
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-8 text-end font-mono text-xs tabular",
								children: row.count
							})
						]
					}, row.id))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 text-sm font-medium",
					children: t(locale, "reports.bySite")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: bySite.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate text-sm",
							children: row.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: row.pct >= 85 ? "font-mono text-sm text-safe tabular" : "font-mono text-sm text-danger tabular",
							children: [row.pct, "%"]
						})]
					}, row.name))
				})] })]
			})
		]
	}) });
}
//#endregion
export { ReportsPage as component };
