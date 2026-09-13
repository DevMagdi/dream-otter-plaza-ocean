import { r as __exportAll } from "../_runtime.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/username-zCyCIgKI.js
var username_zCyCIgKI_exports = /* @__PURE__ */ __exportAll({
	emailToUsername: () => emailToUsername,
	usernameToEmail: () => usernameToEmail
});
var DOMAIN = "aegis.local";
function usernameToEmail(username) {
	const u = username.trim().toLowerCase();
	if (!u) return "";
	if (u.includes("@")) return u;
	return `${u}@${DOMAIN}`;
}
function emailToUsername(email) {
	const e = email.trim().toLowerCase();
	if (e.endsWith(`@${DOMAIN}`)) return e.slice(0, -12);
	return e;
}
//#endregion
export { usernameToEmail as n, username_zCyCIgKI_exports as r, emailToUsername as t };
