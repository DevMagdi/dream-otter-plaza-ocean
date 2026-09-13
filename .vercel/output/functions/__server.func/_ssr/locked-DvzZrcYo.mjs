import { v as t } from "./plans-ByR_bG0u.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { l as useCurrentUserState, t as AegisMark, u as usePpeStore } from "./use-current-user-B2nQN3IW.mjs";
import { n as UserButton, t as RedirectToSignIn } from "./gates-BPeBtP08.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/locked-DvzZrcYo.js
var import_jsx_runtime = require_jsx_runtime();
function LockedPage() {
	const locale = usePpeStore((s) => s.locale);
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-bg" });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-bg px-4 text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md space-y-4 rounded-xl bg-surface p-8 text-center shadow-[var(--shadow-border)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AegisMark, { className: "mx-auto size-10" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-medium",
					children: t(locale, "locked.title")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: t(locale, "locked.hint")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center pt-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
				})
			]
		})
	});
}
//#endregion
export { LockedPage as component };
