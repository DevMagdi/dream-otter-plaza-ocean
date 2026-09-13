import { g as riskLabel } from "./plans-ByR_bG0u.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as Badge } from "./badge-CzejCPnf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/risk-badge-SwIJGzoN.js
var import_jsx_runtime = require_jsx_runtime();
var TONE = {
	low: "safe",
	medium: "warn",
	high: "danger",
	critical: "danger"
};
function RiskBadge({ risk, locale }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: TONE[risk],
		children: riskLabel(locale, risk)
	});
}
//#endregion
export { RiskBadge as t };
