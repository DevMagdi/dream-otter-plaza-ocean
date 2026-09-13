import { o as __toESM } from "../_runtime.mjs";
import { d as formatDateTime, h as ppeLabel, t as CAMERAS, u as cn, v as t } from "./plans-ByR_bG0u.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { u as usePpeStore } from "./use-current-user-B2nQN3IW.mjs";
import { t as Button } from "./button-Cdb7sc_1.mjs";
import { n as Card, t as AppShell } from "./card-DpPnLwzZ.mjs";
import { t as Badge } from "./badge-CzejCPnf.mjs";
import { t as RiskBadge } from "./risk-badge-SwIJGzoN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/incidents-6OIcWY-Z.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function IncidentsPage() {
	const locale = usePpeStore((s) => s.locale);
	const sites = usePpeStore((s) => s.sites);
	const incidents = usePpeStore((s) => s.incidents);
	const setStatus = usePpeStore((s) => s.setIncidentStatus);
	const ackOpen = usePpeStore((s) => s.ackOpen);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const rows = incidents.filter((i) => filter === "all" ? true : i.status === filter).sort((a, b) => b.at - a.at);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.2em] text-subtle",
					children: "HSE"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 text-2xl font-medium tracking-tight",
					children: t(locale, "incident.title")
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					size: "sm",
					onClick: ackOpen,
					children: t(locale, "incident.ackAll")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					"all",
					"open",
					"ack",
					"closed"
				].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setFilter(f),
					className: cn("h-9 rounded-full px-3 text-xs", filter === f ? "bg-primary text-primary-fg" : "bg-elevated text-muted"),
					children: f === "all" ? t(locale, "incident.filter") : t(locale, `incident.${f}`)
				}, f))
			}),
			rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "py-12 text-center text-sm text-muted",
				children: t(locale, "incident.empty")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: rows.map((inc) => {
					const site = sites.find((s) => s.id === inc.siteId);
					const cam = CAMERAS.find((c) => c.id === inc.cameraId);
					const zone = site?.zones.find((z) => z.id === inc.zoneId);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "flex flex-col gap-3 p-3 sm:flex-row sm:items-center",
						children: [
							cam ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: cam.image,
								alt: "",
								className: "h-20 w-full rounded-md object-cover outline outline-1 -outline-offset-1 outline-fg/10 sm:h-16 sm:w-28"
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskBadge, {
											risk: inc.risk,
											locale
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: inc.status === "open" ? "danger" : inc.status === "ack" ? "warn" : "mute",
											children: t(locale, `incident.${inc.status}`)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 truncate text-sm",
										children: inc.missing.map((m) => ppeLabel(locale, m)).join(" · ")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted",
										children: [
											site ? locale === "ar" ? site.nameAr : site.name : "",
											zone ? ` · ${locale === "ar" ? zone.nameAr : zone.name}` : "",
											" · ",
											formatDateTime(locale, inc.at)
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [inc.status === "open" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => setStatus(inc.id, "ack"),
									children: t(locale, "incident.ack")
								}) : null, inc.status !== "closed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => setStatus(inc.id, "closed"),
									children: t(locale, "incident.closed")
								}) : null]
							})
						]
					}) }, inc.id);
				})
			})
		]
	}) });
}
//#endregion
export { IncidentsPage as component };
