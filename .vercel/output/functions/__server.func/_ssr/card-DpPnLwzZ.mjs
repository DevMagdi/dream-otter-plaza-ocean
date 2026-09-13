import { o as __toESM } from "../_runtime.mjs";
import { u as cn, v as t } from "./plans-ByR_bG0u.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { d as useRouterState, v as Link, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as loadWorkspace, l as useCurrentUserState, t as AegisMark, u as usePpeStore } from "./use-current-user-B2nQN3IW.mjs";
import { t as Button } from "./button-Cdb7sc_1.mjs";
import { n as UserButton, t as RedirectToSignIn } from "./gates-BPeBtP08.mjs";
import { E as Activity, S as ClipboardList, c as Settings, p as LayoutDashboard, s as Shield, w as Camera, y as Factory } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/card-DpPnLwzZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var HOUR = 36e5;
function HourlyScheduler() {
	const hourlyEnabled = usePpeStore((s) => s.settings.hourlyEnabled);
	const lastBriefAt = usePpeStore((s) => s.settings.lastBriefAt);
	const generateBrief = usePpeStore((s) => s.generateBrief);
	const locale = usePpeStore((s) => s.locale);
	(0, import_react.useEffect)(() => {
		if (!hourlyEnabled) return;
		const tick = () => {
			const state = usePpeStore.getState();
			if (!state.settings.hourlyEnabled) return;
			if (Date.now() - state.settings.lastBriefAt < HOUR) return;
			state.generateBrief();
			toast.message(t(state.locale, "toast.briefReady"));
		};
		tick();
		const id = window.setInterval(tick, 3e4);
		return () => window.clearInterval(id);
	}, [
		hourlyEnabled,
		lastBriefAt,
		generateBrief,
		locale
	]);
	return null;
}
var NAV = [
	{
		to: "/",
		key: "nav.dashboard",
		icon: LayoutDashboard
	},
	{
		to: "/scan",
		key: "nav.scan",
		icon: Camera
	},
	{
		to: "/incidents",
		key: "nav.incidents",
		icon: ClipboardList
	},
	{
		to: "/sites",
		key: "nav.sites",
		icon: Factory
	},
	{
		to: "/reports",
		key: "nav.reports",
		icon: Activity
	}
];
function AppShell({ children }) {
	const locale = usePpeStore((s) => s.locale);
	const setLocale = usePpeStore((s) => s.setLocale);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const openCount = usePpeStore((s) => s.incidents.filter((i) => i.status === "open").length);
	const readyBriefs = usePpeStore((s) => s.briefs.filter((b) => b.status === "ready").length);
	const role = usePpeStore((s) => s.role);
	const workspaceReady = usePpeStore((s) => s.workspaceReady);
	const hydrateWorkspace = usePpeStore((s) => s.hydrateWorkspace);
	const resetWorkspace = usePpeStore((s) => s.resetWorkspace);
	const { user, isPending } = useCurrentUserState();
	const [gate, setGate] = (0, import_react.useState)(null);
	const userId = user?.id;
	(0, import_react.useEffect)(() => {
		document.documentElement.lang = locale;
		document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
	}, [locale]);
	(0, import_react.useEffect)(() => {
		if (!userId || !user) return;
		let cancelled = false;
		resetWorkspace();
		setGate(null);
		loadWorkspace({ data: {
			displayName: user.displayName ?? void 0,
			email: user.primaryEmail ?? void 0
		} }).then((res) => {
			if (cancelled) return;
			if (res.ok) {
				hydrateWorkspace(res.workspace);
				return;
			}
			setGate(res.reason);
		}).catch(() => {
			if (!cancelled) setGate("error");
		});
		return () => {
			cancelled = true;
		};
	}, [userId]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShellChrome, {});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (gate === "no_org") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/locked" });
	if (gate === "error") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShellChrome, {});
	if (!workspaceReady) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShellChrome, {});
	const admin = role === "owner" || role === "admin";
	const isPlatform = role === "platform";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HourlyScheduler, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "fixed inset-y-0 start-0 z-30 hidden w-60 flex-col border-e border-border bg-surface/70 px-3 py-6 backdrop-blur-sm lg:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "mt-10 flex flex-1 flex-col gap-1",
						children: isPlatform ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/platform",
							className: cn("relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-150", pathname === "/platform" ? "bg-elevated text-fg" : "text-muted hover:bg-elevated/70 hover:text-fg"),
							children: [
								pathname === "/platform" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-y-2 start-0 w-0.5 rounded-full bg-primary" }) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
									className: "size-4",
									strokeWidth: 1.75
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(locale, "nav.platform") })
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [NAV.map((item) => {
							const active = pathname === item.to;
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								className: cn("relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-150", active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated/70 hover:text-fg"),
								children: [
									active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-y-2 start-0 w-0.5 rounded-full bg-primary" }) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										className: "size-4",
										strokeWidth: 1.75
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(locale, item.key) }),
									item.to === "/incidents" && openCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ms-auto font-mono text-xs text-danger tabular",
										children: openCount
									}) : null,
									item.to === "/reports" && readyBriefs > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ms-auto font-mono text-xs text-warn tabular",
										children: readyBriefs
									}) : null
								]
							}, item.to);
						}), admin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/admin",
							className: cn("relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-150", pathname === "/admin" ? "bg-elevated text-fg" : "text-muted hover:bg-elevated/70 hover:text-fg"),
							children: [
								pathname === "/admin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-y-2 start-0 w-0.5 rounded-full bg-primary" }) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
									className: "size-4",
									strokeWidth: 1.75
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(locale, "nav.admin") })
							]
						}) : null] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/settings",
						className: cn("mb-4 flex h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-150", pathname === "/settings" ? "bg-elevated text-fg" : "text-muted hover:bg-elevated/70 hover:text-fg"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {
							className: "size-4",
							strokeWidth: 1.75
						}), t(locale, "nav.settings")]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-bg/80 px-4 backdrop-blur-sm lg:ms-60",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5 lg:hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AegisMark, { className: "size-8" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-medium tracking-wide",
							children: t(locale, "appName")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xs uppercase tracking-widest text-subtle",
							children: "PPE"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "hidden max-w-md truncate text-sm text-muted lg:block",
						children: t(locale, "tagline")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/settings",
									"aria-label": t(locale, "nav.settings"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {
										className: "size-4",
										strokeWidth: 1.75
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => setLocale(locale === "ar" ? "en" : "ar"),
								"aria-label": "language",
								children: t(locale, "lang")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "px-4 pb-24 pt-6 lg:ms-60 lg:px-10 lg:pb-12",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur-sm lg:hidden",
				children: isPlatform ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/platform",
					className: "flex h-16 flex-col items-center justify-center gap-1 text-2xs text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
						className: "size-5",
						strokeWidth: 1.75
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(locale, "nav.platform") })]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("grid", admin ? "grid-cols-6" : "grid-cols-5"),
					children: [NAV.map((item) => {
						const active = pathname === item.to;
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("relative flex h-16 flex-col items-center justify-center gap-1 text-2xs", active ? "text-fg" : "text-muted"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: "size-5",
									strokeWidth: 1.75
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(locale, item.key) }),
								item.to === "/incidents" && openCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute end-4 top-2 size-1.5 rounded-full bg-danger" }) : null
							]
						}, item.to);
					}), admin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/admin",
						className: cn("flex h-16 flex-col items-center justify-center gap-1 text-2xs", pathname === "/admin" ? "text-fg" : "text-muted"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
							className: "size-5",
							strokeWidth: 1.75
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(locale, "nav.admin") })]
					}) : null]
				})
			})
		]
	});
}
function ShellChrome() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-16 border-b border-border bg-bg/80" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl px-4 py-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-40 animate-pulse rounded-md bg-elevated" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-28 animate-pulse rounded-xl bg-surface" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-28 animate-pulse rounded-xl bg-surface" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-28 animate-pulse rounded-xl bg-surface" })
				]
			})]
		})]
	});
}
function Brand() {
	const locale = usePpeStore((s) => s.locale);
	const org = usePpeStore((s) => s.org);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/",
		className: "flex items-center gap-3 px-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AegisMark, { className: "size-9" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm font-semibold tracking-[0.2em]",
			children: t(locale, "appName")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-2xs uppercase tracking-[0.24em] text-subtle",
			children: org ? locale === "ar" ? org.nameAr || org.name : org.name : "PPE Vision"
		})] })]
	});
}
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]", className),
		...props
	});
}
//#endregion
export { Card as n, AppShell as t };
