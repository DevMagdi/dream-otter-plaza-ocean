import { _ as seatsFor, i as SITES, l as buildBrief, n as DEFAULT_CAMERA_RULES, o as applyChecks, t as CAMERAS, y as uid } from "./plans-ByR_bG0u.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as getServerFnById, n as createServerFn, r as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { Jt as number, Qt as string, Ut as array, Vt as _enum, Wt as boolean, Yt as object, en as unknown } from "../_libs/@better-auth/core+[...].mjs";
import { t as authClient } from "./client-De7e1aE7.mjs";
import { n as PPE_CATALOG, r as authMiddleware } from "./profiles-DeO1U3zD.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-current-user-B2nQN3IW.js
var import_jsx_runtime = require_jsx_runtime();
function AegisMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className,
		"aria-hidden": "true",
		fill: "none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M16 3.2 6.4 7.2v7.6c0 6.2 4.1 11.9 9.6 13.6 5.5-1.7 9.6-7.4 9.6-13.6V7.2L16 3.2Z",
				className: "fill-elevated stroke-accent",
				strokeWidth: "1.4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M10.2 14.2h11.6c.2 2.8-1.3 5.8-5.8 7.2-4.5-1.4-6-4.4-5.8-7.2Z",
				className: "fill-accent/80"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M12.4 14.2h7.2v-1.4c0-1.7-1.6-2.8-3.6-2.8s-3.6 1.1-3.6 2.8v1.4Z",
				className: "fill-accent"
			})
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var PpeField = _enum(PPE_CATALOG);
var IndustryField = _enum([
	"construction",
	"oilgas",
	"chemical",
	"food",
	"warehouse",
	"welding",
	"electrical",
	"mining",
	"manufacturing",
	"pharma",
	"hospital"
]);
var loadWorkspace = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	displayName: string().max(80).optional(),
	email: string().max(120).optional()
})).handler(createSsrRpc("0af5d2e5f5dc9f81d0a05fa0a077e423cacc6017b99039a161972411591c0c8d"));
var saveCameraRule = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	cameraId: string().max(40).regex(/^[a-z0-9-]+$/),
	enabled: boolean(),
	checks: array(PpeField).max(PPE_CATALOG.length)
})).handler(createSsrRpc("357f84cd11b977c4ffabbd661ba9d16d85bf4d919934cebe8f459fd0e78de9e6"));
var saveOrgSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	managerName: string().max(80).optional(),
	managerEmail: string().max(120).optional(),
	hourlyEnabled: boolean().optional(),
	lastBriefAt: number().optional()
})).handler(createSsrRpc("5b384608232a8ef5074ff2bfed01cdf548f1fcf4957dedb9be0369c2f8ec9b57"));
var saveIncidentStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string(),
	status: _enum([
		"open",
		"ack",
		"closed"
	])
})).handler(createSsrRpc("1ea437c73e0ae25d5f425304653442e68c0ff69b9c57781113d979ea70ee9f93"));
var saveAckOpen = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("44483174eb4c5d7558285c2c7cd7f72d0e780403c94de6fba96272a8655716a5"));
var saveSite = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string().max(40).regex(/^[a-z0-9-]+$/),
	name: string().max(80),
	nameAr: string().max(80),
	industry: IndustryField,
	city: string().max(80),
	cityAr: string().max(80),
	zones: array(object({
		id: string().max(40),
		name: string().max(80),
		nameAr: string().max(80),
		required: array(PpeField).max(PPE_CATALOG.length)
	})).max(20)
})).handler(createSsrRpc("fbcc422100e66b8d2497be975a08aa45550c6662ac6296ea7fd12f8132f64a1f"));
var saveScanAndIncidents = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	scan: object({
		id: string().max(40),
		at: number(),
		siteId: string().max(40),
		zoneId: string().max(40),
		cameraId: string().max(40),
		source: _enum([
			"sample",
			"ai",
			"webcam",
			"upload"
		]),
		persons: number().int().min(0).max(50),
		violations: number().int().min(0).max(50),
		risk: _enum([
			"low",
			"medium",
			"high",
			"critical"
		]),
		compliance: number().min(0).max(1)
	}),
	incidents: array(object({
		id: string().max(40),
		at: number(),
		siteId: string().max(40),
		zoneId: string().max(40),
		cameraId: string().max(40),
		personId: string().max(20),
		missing: array(PpeField).max(PPE_CATALOG.length),
		present: array(PpeField).max(PPE_CATALOG.length),
		risk: _enum([
			"low",
			"medium",
			"high",
			"critical"
		]),
		summary: string().max(280),
		summaryAr: string().max(280),
		status: _enum([
			"open",
			"ack",
			"closed"
		])
	})).max(20)
})).handler(createSsrRpc("b330a6ef31603ce5f7e915313057d7dbec68eec8331c0fe11a4a7a14cb7006cd"));
var saveBrief = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ brief: object({
	id: string(),
	from: number(),
	to: number(),
	createdAt: number(),
	status: _enum(["ready", "sent"]),
	people: array(unknown())
}) })).handler(createSsrRpc("3a925db62e3108d4991a4cc6732b0aab67b300a8f5dfdbf475bfd7bc15d25a81"));
var updateOrg = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	name: string().max(80).optional(),
	nameAr: string().max(80).optional(),
	plan: _enum([
		"trial",
		"plant",
		"enterprise"
	]).optional()
})).handler(createSsrRpc("ea0167f1a893120e551d76a1eb8e6a2ff25b287878028cd67a30d75266d132a5"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	email: string().max(120).optional(),
	role: _enum(["admin", "member"]).optional()
})).handler(createSsrRpc("8bea8f236a2e6c0b54c82fb5233fe7546be6009c8873809851cc6f2a59d8465e"));
var updateMemberRole = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	userId: string().max(80),
	role: _enum(["admin", "member"])
})).handler(createSsrRpc("24904add93c7af3d32f11aed01647ed29e6bce19326f92b4f3b878524064b9c3"));
var removeMember = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ userId: string().max(80) })).handler(createSsrRpc("ed750d80abd57bea1c11ffa84d725d10468afebe3622663b5505088eb9598306"));
var createPlant = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	name: string().min(2).max(80),
	nameAr: string().min(2).max(80),
	plan: _enum([
		"trial",
		"plant",
		"enterprise"
	])
})).handler(createSsrRpc("dcf03794dc28f1e62362985c9ee0c9ab7b71792a9545ae2b429292019ed4eb1a"));
var provisionUser = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	username: string().regex(/^[a-zA-Z0-9._-]{3,32}$/),
	password: string().min(8).max(72),
	displayName: string().min(2).max(80),
	orgId: string().max(40),
	role: _enum([
		"owner",
		"admin",
		"member"
	])
})).handler(createSsrRpc("0779fbeb8c575dbedb9807253de170b8796830f1041b69233b74f10d1aad3a52"));
var setUserPassword = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	userId: string().max(80),
	password: string().min(8).max(72)
})).handler(createSsrRpc("8c8fb8023dfa0d5074d660b52ccd9079a08a7bcb2e27e0e1caad8a13bbbae250"));
function seedIncidents(now) {
	const samples = [];
	for (const cam of CAMERAS) {
		const checks = DEFAULT_CAMERA_RULES[cam.id]?.checks ?? [];
		(cam.cached ? applyChecks(cam.cached, checks).persons.filter((p) => !p.compliant) : []).forEach((p, i) => {
			samples.push({
				cam,
				hoursAgo: .4 + i * .2 + cam.id.length % 3 * .15,
				personId: p.id,
				status: "open"
			});
		});
	}
	const extra = [
		{
			cam: CAMERAS[0],
			hoursAgo: 3,
			personId: "P2",
			status: "closed"
		},
		{
			cam: CAMERAS[1],
			hoursAgo: 5,
			personId: "P1",
			status: "ack"
		},
		{
			cam: CAMERAS[3],
			hoursAgo: 7,
			personId: "P1",
			status: "closed"
		},
		{
			cam: CAMERAS[5],
			hoursAgo: 9,
			personId: "P2",
			status: "closed"
		},
		{
			cam: CAMERAS[5],
			hoursAgo: 11,
			personId: "P3",
			status: "ack"
		},
		{
			cam: CAMERAS[0],
			hoursAgo: 14,
			personId: "P2",
			status: "closed"
		},
		{
			cam: CAMERAS[3],
			hoursAgo: 16,
			personId: "P1",
			status: "closed"
		},
		{
			cam: CAMERAS[1],
			hoursAgo: 18,
			personId: "P1",
			status: "closed"
		}
	];
	return [...samples, ...extra].map((s) => {
		const checks = DEFAULT_CAMERA_RULES[s.cam.id]?.checks ?? [];
		const person = s.cam.cached ? applyChecks(s.cam.cached, checks).persons.find((p) => p.id === s.personId) : void 0;
		const missing = person?.missing ?? ["helmet"];
		const present = person?.present ?? [];
		const risk = person && !person.compliant ? s.cam.cached?.risk ?? "high" : "low";
		return {
			id: `inc_${s.cam.id}_${s.personId}_${s.status}_${String(s.hoursAgo).replace(".", "p")}`,
			at: now - s.hoursAgo * 36e5,
			siteId: s.cam.siteId,
			zoneId: s.cam.zoneId,
			cameraId: s.cam.id,
			personId: s.personId,
			missing,
			present,
			risk,
			summary: s.cam.cached?.summary ?? "PPE missing",
			summaryAr: s.cam.cached?.summaryAr ?? "نقص معدات وقاية",
			status: s.status
		};
	});
}
function seedScans(now) {
	return CAMERAS.map((cam, i) => {
		const checks = DEFAULT_CAMERA_RULES[cam.id]?.checks ?? [];
		const result = cam.cached ? applyChecks(cam.cached, checks) : null;
		const persons = result?.persons.length ?? 0;
		const violations = result?.persons.filter((p) => !p.compliant).length ?? 0;
		return {
			id: `scan_${cam.id}`,
			at: now - (i + 1) * 40 * 6e4,
			siteId: cam.siteId,
			zoneId: cam.zoneId,
			cameraId: cam.id,
			source: "sample",
			persons,
			violations,
			risk: result?.risk ?? "low",
			compliance: persons ? (persons - violations) / persons : 1
		};
	});
}
var now = Math.floor(Date.now() / 6e4) * 6e4;
var seededIncidents = seedIncidents(now);
var firstBrief = {
	...buildBrief(seededIncidents, now - 36e5, now),
	id: "brief_seed",
	createdAt: now
};
var defaultSettings = {
	managerName: "مدير السلامة",
	managerEmail: "",
	hourlyEnabled: true,
	lastBriefAt: now
};
function persistRule(get, cameraId) {
	if (!get().workspaceReady) return;
	const rule = get().cameraRules[cameraId];
	if (!rule) return;
	saveCameraRule({ data: {
		cameraId,
		enabled: rule.enabled,
		checks: rule.checks
	} });
}
var usePpeStore = create()(persist((set, get) => ({
	locale: "ar",
	workspaceReady: false,
	org: null,
	members: [],
	plants: [],
	directory: [],
	role: "member",
	sites: SITES,
	activeSiteId: SITES[0].id,
	incidents: seededIncidents,
	scans: seedScans(now),
	cameraRules: { ...DEFAULT_CAMERA_RULES },
	settings: defaultSettings,
	briefs: [firstBrief],
	setLocale: (locale) => set({ locale }),
	hydrateWorkspace: (payload) => set({
		workspaceReady: true,
		org: payload.org,
		members: payload.members,
		plants: payload.plants,
		directory: payload.directory,
		role: payload.me.role,
		sites: payload.sites,
		activeSiteId: payload.sites[0]?.id ?? get().activeSiteId,
		incidents: payload.incidents,
		scans: payload.scans,
		cameraRules: {
			...DEFAULT_CAMERA_RULES,
			...payload.cameraRules
		},
		settings: payload.settings,
		briefs: payload.briefs
	}),
	resetWorkspace: () => set({
		workspaceReady: false,
		org: null,
		members: [],
		plants: [],
		directory: [],
		role: "member"
	}),
	setActiveSite: (id) => set({ activeSiteId: id }),
	upsertSite: (site) => {
		set({ sites: get().sites.some((s) => s.id === site.id) ? get().sites.map((s) => s.id === site.id ? site : s) : [...get().sites, site] });
		if (get().workspaceReady) saveSite({ data: {
			id: site.id,
			name: site.name,
			nameAr: site.nameAr,
			industry: site.industry,
			city: site.city,
			cityAr: site.cityAr,
			zones: site.zones
		} });
	},
	setSettings: (patch) => {
		set({ settings: {
			...get().settings,
			...patch
		} });
		if (get().workspaceReady) saveOrgSettings({ data: patch });
	},
	setCameraEnabled: (cameraId, enabled) => {
		const current = get().cameraRules[cameraId] ?? DEFAULT_CAMERA_RULES[cameraId] ?? {
			enabled: true,
			checks: ["helmet"]
		};
		const checks = Array.isArray(current.checks) ? current.checks : [];
		set({ cameraRules: {
			...get().cameraRules,
			[cameraId]: {
				enabled,
				checks
			}
		} });
		persistRule(get, cameraId);
	},
	toggleCameraCheck: (cameraId, ppe) => {
		const current = get().cameraRules[cameraId] ?? DEFAULT_CAMERA_RULES[cameraId] ?? {
			enabled: true,
			checks: []
		};
		const base = Array.isArray(current.checks) ? current.checks : [];
		const checks = base.includes(ppe) ? base.filter((x) => x !== ppe) : [...base, ppe];
		set({ cameraRules: {
			...get().cameraRules,
			[cameraId]: {
				enabled: current.enabled !== false,
				checks
			}
		} });
		persistRule(get, cameraId);
	},
	setCameraChecks: (cameraId, checks) => {
		const current = get().cameraRules[cameraId] ?? DEFAULT_CAMERA_RULES[cameraId] ?? {
			enabled: true,
			checks: []
		};
		set({ cameraRules: {
			...get().cameraRules,
			[cameraId]: {
				enabled: current.enabled !== false,
				checks: [...checks]
			}
		} });
		persistRule(get, cameraId);
	},
	recordAnalysis: ({ siteId, zoneId, cameraId, source, result }) => {
		const persons = result.persons.length;
		const violations = result.persons.filter((p) => !p.compliant).length;
		const scan = {
			id: uid("scan"),
			at: Date.now(),
			siteId,
			zoneId,
			cameraId,
			source,
			persons,
			violations,
			risk: result.risk,
			compliance: persons ? (persons - violations) / persons : 1
		};
		const fresh = result.persons.filter((p) => !p.compliant).map((p) => ({
			id: uid("inc"),
			at: Date.now(),
			siteId,
			zoneId,
			cameraId,
			personId: p.id,
			missing: p.missing,
			present: p.present,
			risk: result.risk,
			summary: result.summary,
			summaryAr: result.summaryAr,
			status: "open"
		}));
		set({
			scans: [scan, ...get().scans].slice(0, 200),
			incidents: [...fresh, ...get().incidents].slice(0, 400)
		});
		if (get().workspaceReady) saveScanAndIncidents({ data: {
			scan,
			incidents: fresh
		} });
	},
	setIncidentStatus: (id, status) => {
		set({ incidents: get().incidents.map((i) => i.id === id ? {
			...i,
			status
		} : i) });
		if (get().workspaceReady) saveIncidentStatus({ data: {
			id,
			status
		} });
	},
	ackOpen: () => {
		set({ incidents: get().incidents.map((i) => i.status === "open" ? {
			...i,
			status: "ack"
		} : i) });
		if (get().workspaceReady) saveAckOpen();
	},
	generateBrief: (from, to) => {
		const end = to ?? Date.now();
		const start = from ?? end - 36e5;
		const brief = buildBrief(get().incidents, start, end);
		set({
			briefs: [brief, ...get().briefs].slice(0, 48),
			settings: {
				...get().settings,
				lastBriefAt: end
			}
		});
		if (get().workspaceReady) saveBrief({ data: { brief: {
			id: brief.id,
			from: brief.from,
			to: brief.to,
			createdAt: brief.createdAt,
			status: brief.status,
			people: brief.people
		} } });
		return brief;
	},
	markBriefSent: (id) => {
		const brief = get().briefs.find((b) => b.id === id);
		set({ briefs: get().briefs.map((b) => b.id === id ? {
			...b,
			status: "sent"
		} : b) });
		if (get().workspaceReady && brief) saveBrief({ data: { brief: {
			id: brief.id,
			from: brief.from,
			to: brief.to,
			createdAt: brief.createdAt,
			status: "sent",
			people: brief.people
		} } });
	},
	patchOrg: (patch) => {
		const org = get().org;
		if (!org) return;
		const next = {
			...org,
			...patch
		};
		if (patch.plan) next.seats = seatsFor(patch.plan);
		set({ org: next });
		if (get().workspaceReady) updateOrg({ data: patch });
	},
	changeMemberRole: (userId, role) => {
		set({ members: get().members.map((m) => m.userId === userId ? {
			...m,
			role
		} : m) });
		if (get().workspaceReady) updateMemberRole({ data: {
			userId,
			role
		} });
	},
	dropMember: (userId) => {
		set({ members: get().members.filter((m) => m.userId !== userId) });
		if (get().workspaceReady) removeMember({ data: { userId } });
	}
}), {
	name: "aegis-ppe-v4",
	partialize: (s) => ({ locale: s.locale })
}));
var FALLBACK_RULE = {
	enabled: true,
	checks: ["helmet"]
};
function cameraRuleOf(rules, cameraId) {
	const rule = rules[cameraId] ?? DEFAULT_CAMERA_RULES[cameraId];
	if (rule && Array.isArray(rule.checks)) return rule;
	return FALLBACK_RULE;
}
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
//#endregion
export { loadWorkspace as a, useCurrentUser as c, createSsrRpc as i, useCurrentUserState as l, cameraRuleOf as n, provisionUser as o, createPlant as r, setUserPassword as s, AegisMark as t, usePpeStore as u };
