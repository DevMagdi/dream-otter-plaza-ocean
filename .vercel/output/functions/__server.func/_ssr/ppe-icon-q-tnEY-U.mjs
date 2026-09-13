import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as Glasses, b as Ear, g as Hand, h as HardHat, o as Shirt, r as UserRound, s as Shield, t as Wind, v as Footprints } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ppe-icon-q-tnEY-U.js
var import_jsx_runtime = require_jsx_runtime();
var MAP = {
	helmet: HardHat,
	vest: Shirt,
	goggles: Glasses,
	gloves: Hand,
	boots: Footprints,
	mask: Wind,
	facemask: Wind,
	ear: Ear,
	harness: Shield,
	faceshield: Shield,
	coverall: Shirt,
	labcoat: Shirt,
	hairnet: UserRound
};
function PpeIcon({ id, className }) {
	const Icon = MAP[id];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
		className,
		strokeWidth: 1.75
	});
}
//#endregion
export { PpeIcon as t };
