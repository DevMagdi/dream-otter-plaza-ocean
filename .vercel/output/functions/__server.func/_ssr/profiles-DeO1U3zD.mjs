import { t as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profiles-DeO1U3zD.js
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-De7e1aE7.mjs").then((n) => n.n).then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-e4O3MyD0.mjs");
	const { requireUserId } = await import("./verify.server-wDfb_VTa.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
var PPE_CATALOG = [
	"helmet",
	"vest",
	"goggles",
	"gloves",
	"boots",
	"mask",
	"facemask",
	"ear",
	"harness",
	"faceshield",
	"coverall",
	"labcoat",
	"hairnet"
];
var INDUSTRIES = {
	construction: {
		required: [
			"helmet",
			"vest",
			"boots",
			"goggles"
		],
		hazards: "fall,impact,dust"
	},
	oilgas: {
		required: [
			"helmet",
			"vest",
			"goggles",
			"gloves",
			"boots",
			"mask"
		],
		hazards: "fire,h2s,pressure"
	},
	chemical: {
		required: [
			"goggles",
			"gloves",
			"mask",
			"boots",
			"coverall"
		],
		hazards: "splash,vapor,toxic"
	},
	food: {
		required: [
			"hairnet",
			"gloves",
			"boots",
			"coverall"
		],
		hazards: "hygiene,slip"
	},
	warehouse: {
		required: [
			"vest",
			"boots",
			"gloves"
		],
		hazards: "vehicle,crush"
	},
	welding: {
		required: [
			"faceshield",
			"gloves",
			"boots",
			"coverall"
		],
		hazards: "arc,spark,fume"
	},
	electrical: {
		required: [
			"helmet",
			"goggles",
			"gloves",
			"boots"
		],
		hazards: "shock,arc-flash"
	},
	mining: {
		required: [
			"helmet",
			"vest",
			"boots",
			"goggles",
			"ear"
		],
		hazards: "collapse,dust,noise"
	},
	manufacturing: {
		required: [
			"helmet",
			"vest",
			"goggles",
			"gloves",
			"boots"
		],
		hazards: "machine,cut,noise"
	},
	pharma: {
		required: [
			"labcoat",
			"facemask",
			"gloves",
			"goggles",
			"hairnet"
		],
		hazards: "sterile,chemical"
	},
	hospital: {
		required: [
			"labcoat",
			"facemask",
			"gloves",
			"hairnet"
		],
		hazards: "infection,splash"
	}
};
function defaultRequired(industry) {
	return [...INDUSTRIES[industry].required];
}
//#endregion
export { defaultRequired as i, PPE_CATALOG as n, authMiddleware as r, INDUSTRIES as t };
