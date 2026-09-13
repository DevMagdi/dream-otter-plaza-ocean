import { o as __toESM } from "../_runtime.mjs";
import { h as ppeLabel, p as industryLabel, u as cn, v as t, y as uid } from "./plans-ByR_bG0u.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as defaultRequired, n as PPE_CATALOG, t as INDUSTRIES } from "./profiles-DeO1U3zD.mjs";
import { u as usePpeStore } from "./use-current-user-B2nQN3IW.mjs";
import { t as Button } from "./button-Cdb7sc_1.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Card, t as AppShell } from "./card-DpPnLwzZ.mjs";
import { t as Badge } from "./badge-CzejCPnf.mjs";
import { n as Label, t as Input } from "./label-DHAi_SxU.mjs";
import { t as PpeIcon } from "./ppe-icon-q-tnEY-U.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sites-Bp1HSfHc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var INDUSTRY_IDS = Object.keys(INDUSTRIES);
function SitesPage() {
	const locale = usePpeStore((s) => s.locale);
	const sites = usePpeStore((s) => s.sites);
	const activeSiteId = usePpeStore((s) => s.activeSiteId);
	const setActiveSite = usePpeStore((s) => s.setActiveSite);
	const upsertSite = usePpeStore((s) => s.upsertSite);
	const [adding, setAdding] = (0, import_react.useState)(false);
	const active = sites.find((s) => s.id === activeSiteId) ?? sites[0];
	function togglePpe(zoneId, id) {
		const next = {
			...active,
			zones: active.zones.map((z) => z.id !== zoneId ? z : {
				...z,
				required: z.required.includes(id) ? z.required.filter((x) => x !== id) : [...z.required, id]
			})
		};
		upsertSite(next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.2em] text-subtle",
					children: t(locale, "sites.industry")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 text-2xl font-medium tracking-tight",
					children: t(locale, "sites.title")
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					size: "sm",
					onClick: () => setAdding((v) => !v),
					children: t(locale, "sites.add")
				})]
			}),
			adding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddSite, {
				locale,
				onCreate: (site) => {
					upsertSite(site);
					setActiveSite(site.id);
					setAdding(false);
					toast.success(t(locale, "toast.saved"));
				}
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto pb-1",
				children: sites.map((site) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setActiveSite(site.id),
					className: cn("h-11 shrink-0 rounded-full px-4 text-sm", site.id === active.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted"),
					children: locale === "ar" ? site.nameAr : site.name
				}, site.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-medium",
					children: locale === "ar" ? active.nameAr : active.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						locale === "ar" ? active.cityAr : active.city,
						" · ",
						industryLabel(locale, active.industry)
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					tone: "mute",
					children: [
						active.zones.length,
						" ",
						t(locale, "sites.zones")
					]
				})]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3",
				children: active.zones.map((zone) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-medium",
						children: locale === "ar" ? zone.nameAr : zone.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: t(locale, "sites.required")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: PPE_CATALOG.map((id) => {
							const on = zone.required.includes(id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => togglePpe(zone.id, id),
								className: cn("flex h-11 items-center gap-2 rounded-full px-3 text-xs", on ? "bg-safe-dim text-safe" : "bg-elevated text-muted"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PpeIcon, {
									id,
									className: "size-3.5"
								}), ppeLabel(locale, id)]
							}, id);
						})
					})
				] }, zone.id))
			})
		]
	}) });
}
function AddSite({ locale, onCreate }) {
	const [name, setName] = (0, import_react.useState)("");
	const [city, setCity] = (0, import_react.useState)("");
	const [industry, setIndustry] = (0, import_react.useState)("manufacturing");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(locale, "sites.name") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (e) => setName(e.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(locale, "sites.city") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: city,
						onChange: (e) => setCity(e.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(locale, "sites.industry") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					value: industry,
					onChange: (e) => setIndustry(e.target.value),
					className: "h-11 w-full rounded-md bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)]",
					children: INDUSTRY_IDS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: id,
						children: industryLabel(locale, id)
					}, id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => {
					if (!name.trim()) return;
					onCreate({
						id: uid("site"),
						name: name.trim(),
						nameAr: name.trim(),
						industry,
						city: city.trim() || "—",
						cityAr: city.trim() || "—",
						zones: [{
							id: uid("zone"),
							name: "Main floor",
							nameAr: "الأرضية الرئيسية",
							required: defaultRequired(industry)
						}]
					});
				},
				children: t(locale, "sites.save")
			})
		]
	});
}
//#endregion
export { SitesPage as component };
