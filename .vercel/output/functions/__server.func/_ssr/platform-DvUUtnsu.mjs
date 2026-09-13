import { o as __toESM } from "../_runtime.mjs";
import { r as PLANS, v as t } from "./plans-ByR_bG0u.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as loadWorkspace, o as provisionUser, r as createPlant, s as setUserPassword, u as usePpeStore } from "./use-current-user-B2nQN3IW.mjs";
import { t as Button } from "./button-Cdb7sc_1.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Card, t as AppShell } from "./card-DpPnLwzZ.mjs";
import { t as Badge } from "./badge-CzejCPnf.mjs";
import { n as Label, t as Input } from "./label-DHAi_SxU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/platform-DvUUtnsu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PlatformPage() {
	const locale = usePpeStore((s) => s.locale);
	const role = usePpeStore((s) => s.role);
	const plants = usePpeStore((s) => s.plants);
	const directory = usePpeStore((s) => s.directory);
	const hydrateWorkspace = usePpeStore((s) => s.hydrateWorkspace);
	const [plantName, setPlantName] = (0, import_react.useState)("");
	const [plantNameAr, setPlantNameAr] = (0, import_react.useState)("");
	const [plan, setPlan] = (0, import_react.useState)("plant");
	const [username, setUsername] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [displayName, setDisplayName] = (0, import_react.useState)("");
	const [orgId, setOrgId] = (0, import_react.useState)(plants[0]?.id ?? "");
	const [userRole, setUserRole] = (0, import_react.useState)("owner");
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (role !== "platform") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	async function refresh() {
		const res = await loadWorkspace({ data: {} });
		if (res.ok) hydrateWorkspace(res.workspace);
	}
	async function onPlant() {
		setBusy(true);
		try {
			const created = await createPlant({ data: {
				name: plantName.trim(),
				nameAr: plantNameAr.trim() || plantName.trim(),
				plan
			} });
			setOrgId(created.id);
			setPlantName("");
			setPlantNameAr("");
			await refresh();
			toast.success(t(locale, "platform.plantOk"));
		} catch {
			toast.error(t(locale, "login.failed"));
		} finally {
			setBusy(false);
		}
	}
	async function onUser() {
		setBusy(true);
		try {
			const target = orgId || plants[0]?.id;
			if (!target) throw new Error("plant");
			const res = await provisionUser({ data: {
				username: username.trim(),
				password,
				displayName: displayName.trim(),
				orgId: target,
				role: userRole
			} });
			toast.success(`${t(locale, "login.user")}: ${res.username}`);
			setUsername("");
			setPassword("");
			setDisplayName("");
			await refresh();
		} catch {
			toast.error(t(locale, "platform.userFail"));
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-2xs uppercase tracking-widest text-subtle",
					children: t(locale, "login.product")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-3xl font-medium tracking-tight",
					children: t(locale, "platform.title")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: t(locale, "platform.hint")
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: t(locale, "platform.plants")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-mono text-3xl tabular",
						children: plants.length
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: t(locale, "admin.users")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-mono text-3xl tabular",
						children: directory.length
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: t(locale, "platform.seatsOpen")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-mono text-3xl tabular",
						children: plants.reduce((n, p) => n + Math.max(0, p.seats - p.usedSeats), 0)
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-medium",
						children: t(locale, "platform.newPlant")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "pn",
								children: t(locale, "admin.orgName")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "pn",
								value: plantName,
								onChange: (e) => setPlantName(e.target.value)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "pa",
								children: t(locale, "admin.orgNameAr")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "pa",
								value: plantNameAr,
								onChange: (e) => setPlantNameAr(e.target.value)
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: PLANS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setPlan(p.id),
							className: plan === p.id ? "h-11 rounded-md bg-primary px-4 text-sm text-primary-fg" : "h-11 rounded-md bg-elevated px-4 text-sm text-muted",
							children: [
								t(locale, `admin.plan.${p.id}`),
								" · ",
								p.seats
							]
						}, p.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: busy || plantName.trim().length < 2,
						onClick: () => void onPlant(),
						children: t(locale, "platform.createPlant")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-medium",
						children: t(locale, "platform.newUser")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: t(locale, "platform.userHint")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "un",
									children: t(locale, "login.user")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "un",
									value: username,
									onChange: (e) => setUsername(e.target.value),
									dir: "ltr"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "pw",
									children: t(locale, "login.password")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "pw",
									type: "text",
									value: password,
									onChange: (e) => setPassword(e.target.value),
									dir: "ltr"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "dn",
									children: t(locale, "login.name")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "dn",
									value: displayName,
									onChange: (e) => setDisplayName(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "pl",
									children: t(locale, "platform.plants")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									id: "pl",
									className: "h-11 w-full rounded-md bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)]",
									value: orgId,
									onChange: (e) => setOrgId(e.target.value),
									children: plants.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: p.id,
										children: [
											locale === "ar" ? p.nameAr || p.name : p.name,
											" (",
											p.usedSeats,
											"/",
											p.seats,
											")"
										]
									}, p.id))
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							"owner",
							"admin",
							"member"
						].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setUserRole(r),
							className: userRole === r ? "h-11 rounded-md bg-primary px-4 text-sm text-primary-fg" : "h-11 rounded-md bg-elevated px-4 text-sm text-muted",
							children: t(locale, `admin.role.${r}`)
						}, r))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: busy || !plants.length || username.trim().length < 3 || password.length < 8,
						onClick: () => void onUser(),
						children: t(locale, "platform.createUser")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-medium",
					children: t(locale, "platform.plants")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: plants.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "flex flex-wrap items-center gap-3 py-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm",
								children: locale === "ar" ? p.nameAr || p.name : p.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									t(locale, `admin.plan.${p.plan}`),
									" · ",
									p.usedSeats,
									"/",
									p.seats
								]
							})]
						})
					}, p.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-medium",
					children: t(locale, "admin.users")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: directory.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-wrap items-center gap-3 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-sm",
									children: u.username
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [
										u.displayName,
										" · ",
										u.orgName
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: "mute",
								children: t(locale, `admin.role.${u.role}`)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => {
									const next = window.prompt(t(locale, "platform.resetPass"), "");
									if (!next || next.length < 8) return;
									setUserPassword({ data: {
										userId: u.userId,
										password: next
									} }).then(() => toast.success(t(locale, "toast.saved"))).catch(() => toast.error(t(locale, "login.failed")));
								},
								children: t(locale, "platform.resetPass")
							})
						]
					}, u.userId))
				})]
			})
		]
	}) });
}
//#endregion
export { PlatformPage as component };
