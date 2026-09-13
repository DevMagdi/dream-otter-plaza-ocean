import { _ as seatsFor, i as SITES, l as buildBrief, n as DEFAULT_CAMERA_RULES, o as applyChecks, t as CAMERAS, y as uid } from "./plans-ByR_bG0u.mjs";
import { n as createServerFn } from "./ssr.mjs";
import { Jt as number, Qt as string, Ut as array, Vt as _enum, Wt as boolean, Yt as object, en as unknown } from "../_libs/@better-auth/core+[...].mjs";
import { n as PPE_CATALOG, r as authMiddleware } from "./profiles-DeO1U3zD.mjs";
import { t as createServerRpc } from "./createServerRpc-CN-evIEF.mjs";
import { t as emailToUsername } from "./username-zCyCIgKI.mjs";
import { r as getSql } from "./db-CDr21QXK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/saas-kY2GK2K8.js
function parseJson(raw, fallback) {
	if (!raw) return fallback;
	try {
		return JSON.parse(raw);
	} catch {
		return fallback;
	}
}
function ms(value) {
	const n = typeof value === "number" ? value : Date.parse(String(value ?? ""));
	return Number.isFinite(n) ? n : Date.now();
}
function iso(ts) {
	return new Date(ts).toISOString();
}
function asRole(v) {
	if (v === "platform" || v === "owner" || v === "admin") return v;
	return "member";
}
function asPlan(v) {
	return v === "plant" || v === "enterprise" ? v : "trial";
}
function clean(s, max = 80) {
	return s.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, max);
}
function forbid() {
	throw new Error("Forbidden");
}
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
async function membershipOf(userId) {
	return (await (await getSql())`select org_id, role, email, display_name from memberships where user_id = ${userId} order by created_at asc limit 1`)[0] ?? null;
}
async function requireOrg(userId) {
	const m = await membershipOf(userId);
	if (!m) throw new Error("No organization");
	return m;
}
async function seedOrg(orgId, userId, email, name, plan, opts) {
	const sql = await getSql();
	const now = Date.now();
	await sql`insert into organizations (id, name, name_ar, plan, created_by, kind) values (${orgId}, ${opts?.orgName || "AEGIS Plant"}, ${opts?.orgNameAr || "منشأة أيجيس"}, ${plan}, ${userId}, ${"plant"})`;
	if (!opts?.skipOwner) await sql`insert into memberships (org_id, user_id, email, display_name, role, username) values (${orgId}, ${userId}, ${email}, ${name}, ${"owner"}, ${emailToUsername(email)})`;
	await sql`insert into org_settings (org_id, manager_name, manager_email, hourly_enabled, last_brief_at) values (${orgId}, ${name || "مدير السلامة"}, ${email}, ${true}, ${iso(now)})`;
	for (const site of SITES) await sql`insert into sites (org_id, id, name, name_ar, industry, city, city_ar, zones_json) values (${orgId}, ${site.id}, ${site.name}, ${site.nameAr}, ${site.industry}, ${site.city}, ${site.cityAr}, ${JSON.stringify(site.zones)})`;
	for (const cam of CAMERAS) {
		const rule = DEFAULT_CAMERA_RULES[cam.id] ?? {
			enabled: true,
			checks: ["helmet"]
		};
		await sql`insert into cameras (org_id, id, site_id, zone_id, name, name_ar, image, kind, enabled, checks_json, cached_json) values (${orgId}, ${cam.id}, ${cam.siteId}, ${cam.zoneId}, ${cam.name}, ${cam.nameAr}, ${cam.image}, ${cam.kind}, ${rule.enabled}, ${JSON.stringify(rule.checks)}, ${cam.cached ? JSON.stringify(cam.cached) : null})`;
	}
	const incidents = [];
	for (const cam of CAMERAS) {
		const checks = DEFAULT_CAMERA_RULES[cam.id]?.checks ?? [];
		const result = cam.cached ? applyChecks(cam.cached, checks) : null;
		(result?.persons.filter((p) => !p.compliant) ?? []).forEach((p, i) => {
			incidents.push({
				id: `inc_${cam.id}_${p.id}_open`,
				at: now - (.4 + i * .2) * 36e5,
				siteId: cam.siteId,
				zoneId: cam.zoneId,
				cameraId: cam.id,
				personId: p.id,
				missing: p.missing,
				present: p.present,
				risk: result?.risk ?? "high",
				summary: result?.summary ?? "PPE missing",
				summaryAr: result?.summaryAr ?? "نقص معدات وقاية",
				status: "open"
			});
		});
	}
	for (const inc of incidents) await sql`insert into incidents (org_id, id, at, site_id, zone_id, camera_id, person_id, missing_json, present_json, risk, summary, summary_ar, status) values (${orgId}, ${inc.id}, ${iso(inc.at)}, ${inc.siteId}, ${inc.zoneId}, ${inc.cameraId}, ${inc.personId}, ${JSON.stringify(inc.missing)}, ${JSON.stringify(inc.present)}, ${inc.risk}, ${inc.summary}, ${inc.summaryAr}, ${inc.status})`;
	for (const cam of CAMERAS) {
		const checks = DEFAULT_CAMERA_RULES[cam.id]?.checks ?? [];
		const result = cam.cached ? applyChecks(cam.cached, checks) : null;
		const persons = result?.persons.length ?? 0;
		const violations = result?.persons.filter((p) => !p.compliant).length ?? 0;
		await sql`insert into scans (org_id, id, at, site_id, zone_id, camera_id, source, persons, violations, risk, compliance) values (${orgId}, ${`scan_${cam.id}`}, ${iso(now - 24e5)}, ${cam.siteId}, ${cam.zoneId}, ${cam.id}, ${"sample"}, ${persons}, ${violations}, ${result?.risk ?? "low"}, ${persons ? (persons - violations) / persons : 1})`;
	}
	const brief = buildBrief(incidents, now - 36e5, now);
	await sql`insert into briefs (org_id, id, from_ts, to_ts, created_at, status, payload_json) values (${orgId}, ${"brief_seed"}, ${iso(brief.from)}, ${iso(brief.to)}, ${iso(now)}, ${"ready"}, ${JSON.stringify(brief.people)})`;
}
async function readWorkspace(orgId, userId) {
	const sql = await getSql();
	const orgRow = (await sql`select id, name, name_ar, plan, kind from organizations where id = ${orgId} limit 1`)[0];
	if (!orgRow) throw new Error("No organization");
	const members = (await sql`select user_id, email, display_name, role, username from memberships where org_id = ${orgId} order by created_at asc`).map((r) => ({
		userId: r.user_id,
		email: r.email,
		username: r.username || emailToUsername(r.email),
		displayName: r.display_name,
		role: asRole(r.role)
	}));
	const me = members.find((m) => m.userId === userId);
	if (!me) throw new Error("No organization");
	const sites = (await sql`select id, name, name_ar, industry, city, city_ar, zones_json from sites where org_id = ${orgId}`).map((r) => ({
		id: r.id,
		name: r.name,
		nameAr: r.name_ar,
		industry: r.industry,
		city: r.city,
		cityAr: r.city_ar,
		zones: parseJson(r.zones_json, [])
	}));
	const camRows = await sql`select id, enabled, checks_json from cameras where org_id = ${orgId}`;
	const cameraRules = {};
	for (const row of camRows) cameraRules[row.id] = {
		enabled: Boolean(row.enabled),
		checks: parseJson(row.checks_json, [])
	};
	const incidents = (await sql`select id, at, site_id, zone_id, camera_id, person_id, missing_json, present_json, risk, summary, summary_ar, status from incidents where org_id = ${orgId} order by at desc`).map((r) => ({
		id: r.id,
		at: ms(r.at),
		siteId: r.site_id,
		zoneId: r.zone_id,
		cameraId: r.camera_id,
		personId: r.person_id,
		missing: parseJson(r.missing_json, []),
		present: parseJson(r.present_json, []),
		risk: r.risk,
		summary: r.summary,
		summaryAr: r.summary_ar,
		status: r.status
	}));
	const scans = (await sql`select id, at, site_id, zone_id, camera_id, source, persons, violations, risk, compliance from scans where org_id = ${orgId} order by at desc`).map((r) => ({
		id: r.id,
		at: ms(r.at),
		siteId: r.site_id,
		zoneId: r.zone_id,
		cameraId: r.camera_id,
		source: r.source,
		persons: Number(r.persons),
		violations: Number(r.violations),
		risk: r.risk,
		compliance: Number(r.compliance)
	}));
	const s = (await sql`select manager_name, manager_email, hourly_enabled, last_brief_at from org_settings where org_id = ${orgId} limit 1`)[0];
	const settings = {
		managerName: s?.manager_name ?? "",
		managerEmail: s?.manager_email ?? "",
		hourlyEnabled: s ? Boolean(s.hourly_enabled) : true,
		lastBriefAt: s?.last_brief_at ? ms(s.last_brief_at) : Date.now()
	};
	const briefs = (await sql`select id, from_ts, to_ts, created_at, status, payload_json from briefs where org_id = ${orgId} order by created_at desc`).map((r) => {
		const people = parseJson(r.payload_json, []);
		return {
			id: r.id,
			from: ms(r.from_ts),
			to: ms(r.to_ts),
			createdAt: ms(r.created_at),
			status: r.status === "sent" ? "sent" : "ready",
			violationCount: people.length,
			people
		};
	});
	const plan = asPlan(orgRow.plan);
	const seats = seatsFor(plan);
	const org = {
		id: orgRow.id,
		name: orgRow.name,
		nameAr: orgRow.name_ar,
		plan,
		seats,
		usedSeats: members.length,
		kind: orgRow.kind === "platform" ? "platform" : "plant"
	};
	let plants = [];
	let directory = [];
	if (org.kind === "platform") {
		const plantRows = await sql`select id, name, name_ar, plan from organizations where kind = ${"plant"} order by created_at desc`;
		plants = [];
		for (const p of plantRows) {
			const counted = await sql`select count(*)::int as n from memberships where org_id = ${p.id}`;
			const n = Number(counted[0]?.n ?? 0);
			plants.push({
				id: p.id,
				name: p.name,
				nameAr: p.name_ar,
				plan: asPlan(p.plan),
				seats: seatsFor(asPlan(p.plan)),
				usedSeats: n,
				kind: "plant"
			});
		}
		directory = (await sql`select m.user_id, m.email, m.display_name, m.role, m.username, m.org_id, o.name as org_name from memberships m join organizations o on o.id = m.org_id where m.role <> ${"platform"} order by m.created_at desc`).map((r) => ({
			userId: r.user_id,
			email: r.email,
			username: r.username || emailToUsername(r.email),
			displayName: r.display_name,
			role: asRole(r.role),
			orgId: r.org_id,
			orgName: r.org_name
		}));
	}
	return {
		org,
		members,
		me,
		plants,
		directory,
		sites: org.kind === "platform" ? [] : sites.length ? sites : SITES,
		cameraRules: org.kind === "platform" ? {} : Object.keys(cameraRules).length ? cameraRules : { ...DEFAULT_CAMERA_RULES },
		incidents: org.kind === "platform" ? [] : incidents,
		scans: org.kind === "platform" ? [] : scans,
		settings,
		briefs: org.kind === "platform" ? [] : briefs
	};
}
async function claimPlatform(userId, email, name) {
	const sql = await getSql();
	if ((await sql`select user_id from memberships where role = ${"platform"} limit 1`)[0]) return false;
	const orgId = uid("plt");
	await sql`insert into organizations (id, name, name_ar, plan, created_by, kind) values (${orgId}, ${"AEGIS"}, ${"أيجيس"}, ${"enterprise"}, ${userId}, ${"platform"})`;
	await sql`insert into memberships (org_id, user_id, email, display_name, role, username) values (${orgId}, ${userId}, ${email}, ${name || "مالك المنتج"}, ${"platform"}, ${emailToUsername(email) || "owner"})`;
	await sql`insert into org_settings (org_id, manager_name, manager_email, hourly_enabled, last_brief_at) values (${orgId}, ${name || "مالك المنتج"}, ${email}, ${false}, ${iso(Date.now())})`;
	return true;
}
var loadWorkspace_createServerFn_handler = createServerRpc({
	id: "0af5d2e5f5dc9f81d0a05fa0a077e423cacc6017b99039a161972411591c0c8d",
	name: "loadWorkspace",
	filename: "src/lib/ppe/saas.ts"
}, (opts) => loadWorkspace.__executeServer(opts));
var loadWorkspace = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	displayName: string().max(80).optional(),
	email: string().max(120).optional()
})).handler(loadWorkspace_createServerFn_handler, async ({ context, data }) => {
	const userId = context.userId;
	const email = clean(data.email ?? "", 120);
	const name = clean(data.displayName ?? "", 80) || emailToUsername(email) || "HSE";
	const current = await membershipOf(userId);
	if (current) return {
		ok: true,
		workspace: await readWorkspace(current.org_id, userId)
	};
	if (await claimPlatform(userId, email, name)) {
		const m = await membershipOf(userId);
		if (m) return {
			ok: true,
			workspace: await readWorkspace(m.org_id, userId)
		};
	}
	return {
		ok: false,
		reason: "no_org"
	};
});
var saveCameraRule_createServerFn_handler = createServerRpc({
	id: "357f84cd11b977c4ffabbd661ba9d16d85bf4d919934cebe8f459fd0e78de9e6",
	name: "saveCameraRule",
	filename: "src/lib/ppe/saas.ts"
}, (opts) => saveCameraRule.__executeServer(opts));
var saveCameraRule = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	cameraId: string().max(40).regex(/^[a-z0-9-]+$/),
	enabled: boolean(),
	checks: array(PpeField).max(PPE_CATALOG.length)
})).handler(saveCameraRule_createServerFn_handler, async ({ context, data }) => {
	const m = await requireOrg(context.userId);
	await (await getSql())`update cameras set enabled = ${data.enabled}, checks_json = ${JSON.stringify(data.checks)} where org_id = ${m.org_id} and id = ${data.cameraId}`;
	return { ok: true };
});
var saveOrgSettings_createServerFn_handler = createServerRpc({
	id: "5b384608232a8ef5074ff2bfed01cdf548f1fcf4957dedb9be0369c2f8ec9b57",
	name: "saveOrgSettings",
	filename: "src/lib/ppe/saas.ts"
}, (opts) => saveOrgSettings.__executeServer(opts));
var saveOrgSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	managerName: string().max(80).optional(),
	managerEmail: string().max(120).optional(),
	hourlyEnabled: boolean().optional(),
	lastBriefAt: number().optional()
})).handler(saveOrgSettings_createServerFn_handler, async ({ context, data }) => {
	const m = await requireOrg(context.userId);
	const sql = await getSql();
	const row = (await sql`select manager_name, manager_email, hourly_enabled, last_brief_at from org_settings where org_id = ${m.org_id} limit 1`)[0];
	const name = clean(data.managerName ?? row?.manager_name ?? "", 80);
	const email = clean(data.managerEmail ?? row?.manager_email ?? "", 120);
	const hourly = data.hourlyEnabled ?? (row ? Boolean(row.hourly_enabled) : true);
	const last = data.lastBriefAt ? iso(data.lastBriefAt) : row?.last_brief_at;
	await sql`insert into org_settings (org_id, manager_name, manager_email, hourly_enabled, last_brief_at) values (${m.org_id}, ${name}, ${email}, ${hourly}, ${last}) on conflict (org_id) do update set manager_name = excluded.manager_name, manager_email = excluded.manager_email, hourly_enabled = excluded.hourly_enabled, last_brief_at = excluded.last_brief_at`;
	return { ok: true };
});
var saveIncidentStatus_createServerFn_handler = createServerRpc({
	id: "1ea437c73e0ae25d5f425304653442e68c0ff69b9c57781113d979ea70ee9f93",
	name: "saveIncidentStatus",
	filename: "src/lib/ppe/saas.ts"
}, (opts) => saveIncidentStatus.__executeServer(opts));
var saveIncidentStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string(),
	status: _enum([
		"open",
		"ack",
		"closed"
	])
})).handler(saveIncidentStatus_createServerFn_handler, async ({ context, data }) => {
	const m = await requireOrg(context.userId);
	await (await getSql())`update incidents set status = ${data.status} where org_id = ${m.org_id} and id = ${data.id}`;
	return { ok: true };
});
var saveAckOpen_createServerFn_handler = createServerRpc({
	id: "44483174eb4c5d7558285c2c7cd7f72d0e780403c94de6fba96272a8655716a5",
	name: "saveAckOpen",
	filename: "src/lib/ppe/saas.ts"
}, (opts) => saveAckOpen.__executeServer(opts));
var saveAckOpen = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(saveAckOpen_createServerFn_handler, async ({ context }) => {
	const m = await requireOrg(context.userId);
	await (await getSql())`update incidents set status = ${"ack"} where org_id = ${m.org_id} and status = ${"open"}`;
	return { ok: true };
});
var saveSite_createServerFn_handler = createServerRpc({
	id: "fbcc422100e66b8d2497be975a08aa45550c6662ac6296ea7fd12f8132f64a1f",
	name: "saveSite",
	filename: "src/lib/ppe/saas.ts"
}, (opts) => saveSite.__executeServer(opts));
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
})).handler(saveSite_createServerFn_handler, async ({ context, data }) => {
	const m = await requireOrg(context.userId);
	await (await getSql())`insert into sites (org_id, id, name, name_ar, industry, city, city_ar, zones_json) values (${m.org_id}, ${data.id}, ${clean(data.name)}, ${clean(data.nameAr)}, ${data.industry}, ${clean(data.city)}, ${clean(data.cityAr)}, ${JSON.stringify(data.zones)}) on conflict (org_id, id) do update set name = excluded.name, name_ar = excluded.name_ar, industry = excluded.industry, city = excluded.city, city_ar = excluded.city_ar, zones_json = excluded.zones_json`;
	return { ok: true };
});
var saveScanAndIncidents_createServerFn_handler = createServerRpc({
	id: "b330a6ef31603ce5f7e915313057d7dbec68eec8331c0fe11a4a7a14cb7006cd",
	name: "saveScanAndIncidents",
	filename: "src/lib/ppe/saas.ts"
}, (opts) => saveScanAndIncidents.__executeServer(opts));
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
})).handler(saveScanAndIncidents_createServerFn_handler, async ({ context, data }) => {
	const m = await requireOrg(context.userId);
	const sql = await getSql();
	const s = data.scan;
	await sql`insert into scans (org_id, id, at, site_id, zone_id, camera_id, source, persons, violations, risk, compliance) values (${m.org_id}, ${s.id}, ${iso(s.at)}, ${s.siteId}, ${s.zoneId}, ${s.cameraId}, ${s.source}, ${s.persons}, ${s.violations}, ${s.risk}, ${s.compliance})`;
	for (const inc of data.incidents) await sql`insert into incidents (org_id, id, at, site_id, zone_id, camera_id, person_id, missing_json, present_json, risk, summary, summary_ar, status) values (${m.org_id}, ${inc.id}, ${iso(inc.at)}, ${inc.siteId}, ${inc.zoneId}, ${inc.cameraId}, ${inc.personId}, ${JSON.stringify(inc.missing)}, ${JSON.stringify(inc.present)}, ${inc.risk}, ${inc.summary}, ${inc.summaryAr}, ${inc.status})`;
	return { ok: true };
});
var saveBrief_createServerFn_handler = createServerRpc({
	id: "3a925db62e3108d4991a4cc6732b0aab67b300a8f5dfdbf475bfd7bc15d25a81",
	name: "saveBrief",
	filename: "src/lib/ppe/saas.ts"
}, (opts) => saveBrief.__executeServer(opts));
var saveBrief = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ brief: object({
	id: string(),
	from: number(),
	to: number(),
	createdAt: number(),
	status: _enum(["ready", "sent"]),
	people: array(unknown())
}) })).handler(saveBrief_createServerFn_handler, async ({ context, data }) => {
	const m = await requireOrg(context.userId);
	const sql = await getSql();
	const b = data.brief;
	await sql`insert into briefs (org_id, id, from_ts, to_ts, created_at, status, payload_json) values (${m.org_id}, ${b.id}, ${iso(b.from)}, ${iso(b.to)}, ${iso(b.createdAt)}, ${b.status}, ${JSON.stringify(b.people)}) on conflict (org_id, id) do update set status = excluded.status, payload_json = excluded.payload_json`;
	await sql`update org_settings set last_brief_at = ${iso(b.createdAt)} where org_id = ${m.org_id}`;
	return { ok: true };
});
var updateOrg_createServerFn_handler = createServerRpc({
	id: "ea0167f1a893120e551d76a1eb8e6a2ff25b287878028cd67a30d75266d132a5",
	name: "updateOrg",
	filename: "src/lib/ppe/saas.ts"
}, (opts) => updateOrg.__executeServer(opts));
var updateOrg = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	name: string().max(80).optional(),
	nameAr: string().max(80).optional(),
	plan: _enum([
		"trial",
		"plant",
		"enterprise"
	]).optional()
})).handler(updateOrg_createServerFn_handler, async ({ context, data }) => {
	const m = await requireOrg(context.userId);
	if (m.role === "member") forbid();
	if (data.plan && m.role !== "platform" && m.role !== "owner") forbid();
	const sql = await getSql();
	const row = (await sql`select name, name_ar, plan from organizations where id = ${m.org_id} limit 1`)[0];
	if (!row) forbid();
	if (data.plan) {
		const counted = await sql`select count(*)::int as n from memberships where org_id = ${m.org_id}`;
		if (Number(counted[0]?.n ?? 0) > seatsFor(data.plan)) forbid();
	}
	await sql`update organizations set name = ${clean(data.name ?? row.name)}, name_ar = ${clean(data.nameAr ?? row.name_ar)}, plan = ${data.plan ?? row.plan} where id = ${m.org_id}`;
	return { ok: true };
});
var createInvite_createServerFn_handler = createServerRpc({
	id: "8bea8f236a2e6c0b54c82fb5233fe7546be6009c8873809851cc6f2a59d8465e",
	name: "createInvite",
	filename: "src/lib/ppe/saas.ts"
}, (opts) => createInvite.__executeServer(opts));
var createInvite = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	email: string().max(120).optional(),
	role: _enum(["admin", "member"]).optional()
})).handler(createInvite_createServerFn_handler, async () => {
	forbid();
});
var updateMemberRole_createServerFn_handler = createServerRpc({
	id: "24904add93c7af3d32f11aed01647ed29e6bce19326f92b4f3b878524064b9c3",
	name: "updateMemberRole",
	filename: "src/lib/ppe/saas.ts"
}, (opts) => updateMemberRole.__executeServer(opts));
var updateMemberRole = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	userId: string().max(80),
	role: _enum(["admin", "member"])
})).handler(updateMemberRole_createServerFn_handler, async ({ context, data }) => {
	if ((await requireOrg(context.userId)).role !== "platform") forbid();
	await (await getSql())`update memberships set role = ${data.role} where user_id = ${data.userId} and role <> ${"platform"} and role <> ${"owner"}`;
	return { ok: true };
});
var removeMember_createServerFn_handler = createServerRpc({
	id: "ed750d80abd57bea1c11ffa84d725d10468afebe3622663b5505088eb9598306",
	name: "removeMember",
	filename: "src/lib/ppe/saas.ts"
}, (opts) => removeMember.__executeServer(opts));
var removeMember = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ userId: string().max(80) })).handler(removeMember_createServerFn_handler, async ({ context, data }) => {
	if ((await requireOrg(context.userId)).role !== "platform") forbid();
	if (data.userId === context.userId) return { ok: true };
	await (await getSql())`delete from memberships where user_id = ${data.userId} and role <> ${"platform"}`;
	return { ok: true };
});
async function requirePlatform(userId) {
	const m = await membershipOf(userId);
	if (!m || m.role !== "platform") forbid();
	return m;
}
var createPlant_createServerFn_handler = createServerRpc({
	id: "dcf03794dc28f1e62362985c9ee0c9ab7b71792a9545ae2b429292019ed4eb1a",
	name: "createPlant",
	filename: "src/lib/ppe/saas.ts"
}, (opts) => createPlant.__executeServer(opts));
var createPlant = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	name: string().min(2).max(80),
	nameAr: string().min(2).max(80),
	plan: _enum([
		"trial",
		"plant",
		"enterprise"
	])
})).handler(createPlant_createServerFn_handler, async ({ context, data }) => {
	await requirePlatform(context.userId);
	const orgId = uid("org");
	await seedOrg(orgId, context.userId, "", clean(data.name), data.plan, {
		skipOwner: true,
		orgName: clean(data.name),
		orgNameAr: clean(data.nameAr)
	});
	return { id: orgId };
});
var provisionUser_createServerFn_handler = createServerRpc({
	id: "0779fbeb8c575dbedb9807253de170b8796830f1041b69233b74f10d1aad3a52",
	name: "provisionUser",
	filename: "src/lib/ppe/saas.ts"
}, (opts) => provisionUser.__executeServer(opts));
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
})).handler(provisionUser_createServerFn_handler, async ({ context, data }) => {
	await requirePlatform(context.userId);
	const sql = await getSql();
	const org = await sql`select plan, kind from organizations where id = ${data.orgId} limit 1`;
	if (!org[0] || org[0].kind === "platform") forbid();
	const counted = await sql`select count(*)::int as n from memberships where org_id = ${data.orgId}`;
	if (Number(counted[0]?.n ?? 0) >= seatsFor(asPlan(org[0].plan))) forbid();
	const { usernameToEmail } = await import("./username-zCyCIgKI.mjs").then((n) => n.r);
	const email = usernameToEmail(data.username);
	if ((await sql.query("select id from \"user\" where email = $1 limit 1", [email]))[0]) forbid();
	const { hashPassword } = await import("./crypto-COYSB0ju.mjs").then((n) => n.t).then((n) => n.t);
	const hash = await hashPassword(data.password);
	const userId = uid("usr");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await sql.query("insert into \"user\" (\"id\", \"name\", \"email\", \"emailVerified\", \"createdAt\", \"updatedAt\") values ($1,$2,$3,$4,$5,$6)", [
		userId,
		clean(data.displayName),
		email,
		false,
		now,
		now
	]);
	await sql.query("insert into \"account\" (\"id\", \"accountId\", \"providerId\", \"userId\", \"password\", \"createdAt\", \"updatedAt\") values ($1,$2,$3,$4,$5,$6,$7)", [
		uid("acc"),
		userId,
		"credential",
		userId,
		hash,
		now,
		now
	]);
	await sql`insert into memberships (org_id, user_id, email, display_name, role, username) values (${data.orgId}, ${userId}, ${email}, ${clean(data.displayName)}, ${data.role}, ${data.username.trim().toLowerCase()})`;
	return {
		userId,
		username: data.username.trim().toLowerCase()
	};
});
var setUserPassword_createServerFn_handler = createServerRpc({
	id: "8c8fb8023dfa0d5074d660b52ccd9079a08a7bcb2e27e0e1caad8a13bbbae250",
	name: "setUserPassword",
	filename: "src/lib/ppe/saas.ts"
}, (opts) => setUserPassword.__executeServer(opts));
var setUserPassword = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	userId: string().max(80),
	password: string().min(8).max(72)
})).handler(setUserPassword_createServerFn_handler, async ({ context, data }) => {
	await requirePlatform(context.userId);
	const { hashPassword } = await import("./crypto-COYSB0ju.mjs").then((n) => n.t).then((n) => n.t);
	const hash = await hashPassword(data.password);
	const sql = await getSql();
	const acc = await sql.query("select id from \"account\" where \"userId\" = $1 and \"providerId\" = $2 limit 1", [data.userId, "credential"]);
	const now = (/* @__PURE__ */ new Date()).toISOString();
	if (acc[0]) await sql.query("update \"account\" set \"password\" = $1, \"updatedAt\" = $2 where id = $3", [
		hash,
		now,
		acc[0].id
	]);
	else await sql.query("insert into \"account\" (\"id\", \"accountId\", \"providerId\", \"userId\", \"password\", \"createdAt\", \"updatedAt\") values ($1,$2,$3,$4,$5,$6,$7)", [
		uid("acc"),
		data.userId,
		"credential",
		data.userId,
		hash,
		now,
		now
	]);
	return { ok: true };
});
//#endregion
export { createInvite_createServerFn_handler, createPlant_createServerFn_handler, loadWorkspace_createServerFn_handler, provisionUser_createServerFn_handler, removeMember_createServerFn_handler, saveAckOpen_createServerFn_handler, saveBrief_createServerFn_handler, saveCameraRule_createServerFn_handler, saveIncidentStatus_createServerFn_handler, saveOrgSettings_createServerFn_handler, saveScanAndIncidents_createServerFn_handler, saveSite_createServerFn_handler, setUserPassword_createServerFn_handler, updateMemberRole_createServerFn_handler, updateOrg_createServerFn_handler };
