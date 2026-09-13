import { o as __toESM } from "../_runtime.mjs";
import { t as CAMERAS, v as t } from "./plans-ByR_bG0u.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as cameraRuleOf, u as usePpeStore } from "./use-current-user-B2nQN3IW.mjs";
import { t as Button } from "./button-Cdb7sc_1.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Card, t as AppShell } from "./card-DpPnLwzZ.mjs";
import { t as Badge } from "./badge-CzejCPnf.mjs";
import { n as Label, t as Input } from "./label-DHAi_SxU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-Cel0HqUI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminPage() {
	const locale = usePpeStore((s) => s.locale);
	const org = usePpeStore((s) => s.org);
	const role = usePpeStore((s) => s.role);
	const members = usePpeStore((s) => s.members);
	const cameraRules = usePpeStore((s) => s.cameraRules);
	const incidents = usePpeStore((s) => s.incidents);
	const patchOrg = usePpeStore((s) => s.patchOrg);
	const [name, setName] = (0, import_react.useState)(org?.name ?? "");
	const [nameAr, setNameAr] = (0, import_react.useState)(org?.nameAr ?? "");
	if (role === "member") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	if (role === "platform") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/platform" });
	const open = incidents.filter((i) => i.status === "open").length;
	const live = CAMERAS.filter((c) => cameraRuleOf(cameraRules, c.id).enabled).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-2xs uppercase tracking-widest text-subtle",
					children: t(locale, "login.product")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-3xl font-medium tracking-tight",
					children: t(locale, "admin.title")
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					tone: "mute",
					children: [
						t(locale, `admin.plan.${org?.plan ?? "trial"}`),
						" · ",
						members.length,
						"/",
						org?.seats ?? 3,
						" ",
						t(locale, "admin.seats")
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: t(locale, "admin.users")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 font-mono text-3xl tabular",
						children: [members.length, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-lg text-muted",
							children: ["/", org?.seats ?? 3]
						})]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: t(locale, "kpi.cameras")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-mono text-3xl tabular",
						children: live
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: t(locale, "kpi.open")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-mono text-3xl text-danger tabular",
						children: open
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-medium",
						children: t(locale, "admin.org")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "org-en",
								children: t(locale, "admin.orgName")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "org-en",
								value: name,
								onChange: (e) => setName(e.target.value)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "org-ar",
								children: t(locale, "admin.orgNameAr")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "org-ar",
								value: nameAr,
								onChange: (e) => setNameAr(e.target.value)
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => {
							patchOrg({
								name: name.trim() || org?.name,
								nameAr: nameAr.trim() || org?.nameAr
							});
							toast.success(t(locale, "toast.saved"));
						},
						children: t(locale, "sites.save")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-medium",
						children: t(locale, "admin.users")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: t(locale, "admin.usersReadOnly")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-border",
						children: members.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex flex-wrap items-center gap-3 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-sm",
									children: m.username || m.email
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs text-muted",
									children: m.displayName
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: m.role === "owner" ? "safe" : "mute",
								children: t(locale, `admin.role.${m.role}`)
							})]
						}, m.userId))
					})
				]
			})
		]
	}) });
}
//#endregion
export { AdminPage as component };
