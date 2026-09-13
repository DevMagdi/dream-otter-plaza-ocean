import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { u as cn } from "./plans-ByR_bG0u.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-CzejCPnf.js
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide", {
	variants: { tone: {
		mute: "bg-elevated text-muted",
		safe: "bg-safe-dim text-safe",
		danger: "bg-danger-dim text-danger",
		warn: "bg-warn-dim text-warn",
		live: "bg-danger-dim text-danger"
	} },
	defaultVariants: { tone: "mute" }
});
function Badge({ className, tone, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ tone }), className),
		...props
	});
}
//#endregion
export { Badge as t };
