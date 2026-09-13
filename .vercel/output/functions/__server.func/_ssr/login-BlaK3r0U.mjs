import { o as __toESM } from "../_runtime.mjs";
import { v as t } from "./plans-ByR_bG0u.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as authClient } from "./client-De7e1aE7.mjs";
import { l as useCurrentUserState, t as AegisMark, u as usePpeStore } from "./use-current-user-B2nQN3IW.mjs";
import { t as Button } from "./button-Cdb7sc_1.mjs";
import { n as Label, t as Input } from "./label-DHAi_SxU.mjs";
import { n as usernameToEmail } from "./username-zCyCIgKI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-BlaK3r0U.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const locale = usePpeStore((s) => s.locale);
	const { user, isPending } = useCurrentUserState();
	const [username, setUsername] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-bg text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AegisMark, { className: "size-10" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: t(locale, "appName")
			})]
		})
	});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	async function onSubmit(e) {
		e.preventDefault();
		setBusy(true);
		setError(null);
		try {
			const res = await authClient.signIn.email({
				email: usernameToEmail(username),
				password
			});
			if (res.error) throw new Error(res.error.message);
			await authClient.getSession().catch(() => void 0);
			window.location.assign("/");
		} catch {
			setError(t(locale, "login.failed"));
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-bg px-4 text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md space-y-6 rounded-xl bg-surface p-6 shadow-[var(--shadow-border)] sm:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AegisMark, { className: "size-10" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold tracking-widest",
						children: t(locale, "appName")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xs uppercase tracking-widest text-subtle",
						children: t(locale, "login.product")
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-medium tracking-tight",
					children: t(locale, "login.title")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: t(locale, "login.hint")
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "space-y-3",
					onSubmit: (e) => void onSubmit(e),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "user",
								children: t(locale, "login.user")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "user",
								required: true,
								value: username,
								onChange: (e) => setUsername(e.target.value),
								autoComplete: "username",
								dir: "ltr"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "password",
								children: t(locale, "login.password")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "password",
								type: "password",
								required: true,
								minLength: 8,
								value: password,
								onChange: (e) => setPassword(e.target.value),
								autoComplete: "current-password"
							})]
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-danger",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full",
							disabled: busy,
							children: t(locale, "login.submit")
						})
					]
				})
			]
		})
	});
}
//#endregion
export { Login as component };
