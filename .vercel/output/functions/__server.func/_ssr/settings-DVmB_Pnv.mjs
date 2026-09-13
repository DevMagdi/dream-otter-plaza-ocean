import { c as briefSubject, h as ppeLabel, m as mailtoHref, n as DEFAULT_CAMERA_RULES, s as briefBody, t as CAMERAS, u as cn, v as t } from "./plans-ByR_bG0u.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as PPE_CATALOG } from "./profiles-DeO1U3zD.mjs";
import { n as cameraRuleOf, u as usePpeStore } from "./use-current-user-B2nQN3IW.mjs";
import { t as Button } from "./button-Cdb7sc_1.mjs";
import { C as Check, x as Download } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Card, t as AppShell } from "./card-DpPnLwzZ.mjs";
import { n as Label, t as Input } from "./label-DHAi_SxU.mjs";
import { t as PpeIcon } from "./ppe-icon-q-tnEY-U.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/@radix-ui/react-switch+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-DVmB_Pnv.js
var import_jsx_runtime = require_jsx_runtime();
function Switch({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
		dir: "ltr",
		className: cn("peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full bg-elevated shadow-[var(--shadow-border)] transition-colors data-[state=checked]:bg-safe", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: "pointer-events-none block size-5 translate-x-1 rounded-full bg-fg transition-transform data-[state=checked]:translate-x-6" })
	});
}
function SettingsPage() {
	const locale = usePpeStore((s) => s.locale);
	const settings = usePpeStore((s) => s.settings);
	const setSettings = usePpeStore((s) => s.setSettings);
	const cameraRules = usePpeStore((s) => s.cameraRules);
	const setCameraEnabled = usePpeStore((s) => s.setCameraEnabled);
	const toggleCameraCheck = usePpeStore((s) => s.toggleCameraCheck);
	const setCameraChecks = usePpeStore((s) => s.setCameraChecks);
	const generateBrief = usePpeStore((s) => s.generateBrief);
	const markBriefSent = usePpeStore((s) => s.markBriefSent);
	const sites = usePpeStore((s) => s.sites);
	function sendNow() {
		if (!settings.managerEmail.trim()) {
			toast.error(t(locale, "settings.emailMissing"));
			return;
		}
		const brief = generateBrief();
		const subject = briefSubject(brief, locale);
		const body = briefBody(brief, locale, sites, settings.managerName);
		markBriefSent(brief.id);
		window.location.href = mailtoHref(settings.managerEmail.trim(), subject, body);
		toast.success(t(locale, "toast.briefReady"));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-2xs uppercase tracking-widest text-subtle",
				children: t(locale, "appName")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 text-3xl font-medium tracking-tight",
				children: t(locale, "settings.title")
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-medium",
					children: t(locale, "settings.cameras")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-2xl text-sm text-muted",
					children: t(locale, "settings.camerasHint")
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-4",
					children: CAMERAS.map((cam) => {
						const rule = cameraRuleOf(cameraRules, cam.id);
						const site = sites.find((s) => s.id === cam.siteId);
						const defaults = DEFAULT_CAMERA_RULES[cam.id]?.checks ?? ["helmet"];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "p-4 sm:p-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-4 lg:flex-row lg:items-start",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/scan",
									search: { cam: cam.id },
									className: "block w-full shrink-0 overflow-hidden rounded-lg lg:w-52",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: cam.image,
										alt: locale === "ar" ? cam.nameAr : cam.name,
										className: "aspect-video w-full object-cover"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-start justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-medium",
												children: locale === "ar" ? cam.nameAr : cam.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-xs text-muted",
												children: [
													site ? locale === "ar" ? site.nameAr : site.name : "",
													" · ",
													rule.checks.length,
													" ",
													t(locale, "settings.selected")
												]
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs text-muted",
													children: rule.enabled ? t(locale, "settings.enabled") : t(locale, "settings.disabled")
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
													checked: rule.enabled,
													onCheckedChange: (v) => setCameraEnabled(cam.id, v),
													"aria-label": t(locale, "settings.enabled")
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 flex flex-wrap gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													type: "button",
													variant: "outline",
													size: "sm",
													disabled: !rule.enabled,
													onClick: () => setCameraChecks(cam.id, [...PPE_CATALOG]),
													children: t(locale, "settings.all")
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													type: "button",
													variant: "outline",
													size: "sm",
													disabled: !rule.enabled,
													onClick: () => setCameraChecks(cam.id, []),
													children: t(locale, "settings.clear")
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													type: "button",
													variant: "ghost",
													size: "sm",
													disabled: !rule.enabled,
													onClick: () => setCameraChecks(cam.id, [...defaults]),
													children: t(locale, "settings.reset")
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4",
											children: PPE_CATALOG.map((id) => {
												const on = rule.checks.includes(id);
												return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCell, {
													id,
													locale,
													on,
													disabled: !rule.enabled,
													onToggle: () => toggleCameraCheck(cam.id, id)
												}, id);
											})
										}),
										rule.enabled && rule.checks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 text-xs text-warn",
											children: locale === "ar" ? "لا يوجد فحص مختار لهذه الكاميرا." : "No checks selected for this camera."
										}) : null
									]
								})]
							})
						}, cam.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-medium",
						children: t(locale, "settings.manager")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: t(locale, "settings.hourlyHint")
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "mgr-name",
								children: t(locale, "settings.managerName")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "mgr-name",
								value: settings.managerName,
								onChange: (e) => setSettings({ managerName: e.target.value })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "mgr-mail",
								children: t(locale, "settings.managerEmail")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "mgr-mail",
								type: "email",
								inputMode: "email",
								placeholder: "safety@plant.com",
								value: settings.managerEmail,
								onChange: (e) => setSettings({ managerEmail: e.target.value })
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3 rounded-lg bg-elevated px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: t(locale, "settings.hourly")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: t(locale, "reports.next")
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: settings.hourlyEnabled,
							onCheckedChange: (v) => setSettings({ hourlyEnabled: v }),
							"aria-label": t(locale, "settings.hourly")
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: sendNow,
						children: t(locale, "reports.sendNow")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-medium",
						children: t(locale, "settings.engine")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: t(locale, "settings.engineLlm")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: t(locale, "settings.engineYolo")
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-elevated px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: t(locale, "settings.factory")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: t(locale, "settings.factoryHint")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "secondary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: "/factory/aegis_ppe_detector.py",
									download: true,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), t(locale, "settings.downloadPy")]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: "/factory/requirements.txt",
									download: true,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), t(locale, "settings.downloadReq")]
								})
							})]
						})
					]
				})]
			})
		]
	}) });
}
function CheckCell({ id, locale, on, disabled, onToggle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		disabled,
		onClick: onToggle,
		"aria-pressed": on,
		className: cn("flex min-h-11 items-center gap-2.5 rounded-md px-3 text-start text-xs transition-colors duration-150", on ? "bg-primary text-primary-fg" : "bg-elevated text-muted hover:text-fg", disabled && "opacity-40"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("flex size-4 shrink-0 items-center justify-center rounded-xs", on ? "bg-primary-fg text-primary" : "bg-bg shadow-[var(--shadow-border)]"),
				children: on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
					className: "size-3",
					strokeWidth: 2.5
				}) : null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PpeIcon, {
				id,
				className: "size-3.5 shrink-0"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate",
				children: ppeLabel(locale, id)
			})
		]
	});
}
//#endregion
export { SettingsPage as component };
