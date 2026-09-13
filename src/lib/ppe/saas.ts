import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, getTenantSql } from "@/lib/db";
import { uid } from "@/lib/utils";
import { applyChecks } from "./checks";
import { CAMERAS, DEFAULT_CAMERA_RULES, SITES } from "./demo";
import { buildBrief } from "./hourly";
import { destForRole, resolveWorkspaceIdentity } from "./identity";
import { seatsFor } from "./plans";
import { PPE_CATALOG } from "./profiles";
import { emailToUsername, usernameToEmail, USERNAME_RE } from "./username";
import { loginBlocked, recordLoginFailure, recordLoginSuccess } from "./throttle";
import type {
  AnalysisResult,
  AppSettings,
  CameraFeed,
  CameraRule,
  HourlyBrief,
  Incident,
  Member,
  Organization,
  PlanId,
  PpeId,
  Role,
  ScanRecord,
  Site,
  WorkspacePayload,
} from "./types";

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function asPlan(v: string): PlanId {
  return v === "plant" || v === "enterprise" || v === "trial" ? v : "trial";
}

function asRole(v: string): Role {
  return v === "platform" || v === "owner" || v === "admin" || v === "member" ? v : "member";
}

function clean(v: string): string {
  return v.trim().slice(0, 80);
}

function iso(msValue: number): string {
  return new Date(msValue).toISOString();
}

function ms(v: string | Date): number {
  const n = typeof v === "string" ? Date.parse(v) : v.getTime();
  return Number.isFinite(n) ? n : Date.now();
}

function forbid(): never {
  throw new Error("forbidden");
}

async function readAppToken(): Promise<string> {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    if (!req) return "";
    const authz = req.headers.get("authorization") || "";
    if (authz.toLowerCase().startsWith("bearer ")) {
      const token = authz.slice(7).trim();
      if (token) return token;
    }
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/(?:^|;\s*)aegis_sid=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  } catch {
    return "";
  }
}

async function actorId(fallback: string, explicitToken?: string): Promise<string> {
  const sql = await getSql();
  const token = explicitToken?.trim() || (await readAppToken());
  if (!token) return fallback;
  const ses = await sql
    .query<{ userId: string }>(
      'select "userId" from "session" where token = $1 and "expiresAt" > $2 limit 1',
      [token, new Date().toISOString()],
    )
    .catch(() => [] as Array<{ userId: string }>);
  return ses[0]?.userId || fallback;
}

async function membershipOf(userId: string) {
  const sql = await getSql();
  try {
    const rows = await sql<{
      org_id: string;
      role: string;
      email: string;
      display_name: string;
      locked: boolean;
    }>`select org_id, role, email, display_name, locked from memberships where user_id = ${userId} order by created_at asc limit 1`;
    return rows[0] ?? null;
  } catch {
    const rows = await sql<{
      org_id: string;
      role: string;
      email: string;
      display_name: string;
    }>`select org_id, role, email, display_name from memberships where user_id = ${userId} order by created_at asc limit 1`;
    const row = rows[0];
    return row ? { ...row, locked: false } : null;
  }
}

async function requireOrg(authUserId: string) {
  const userId = await actorId(authUserId);
  const m = await membershipOf(userId);
  if (!m) forbid();
  if (m.role !== "platform" && m.locked) forbid();
  return m;
}

async function requireStaff(userId: string) {
  const m = await requireOrg(userId);
  if (m.role === "member") forbid();
  return m;
}

async function assertPlatform(authUserId: string) {
  const userId = await actorId(authUserId);
  const m = await membershipOf(userId);
  if (!m || m.role !== "platform") forbid();
  return m;
}

const StrongPassword = z
  .string()
  .min(10)
  .max(72)
  .refine((s) => /[A-Za-z]/.test(s) && /[0-9]/.test(s));

async function seedOrg(
  orgId: string,
  ownerId: string,
  ownerEmail: string,
  orgName: string,
  plan: PlanId,
  opts?: { skipOwner?: boolean; orgName?: string; orgNameAr?: string },
) {
  const sql = await getSql();
  const now = Date.now();
  const name = opts?.orgName || orgName;
  const nameAr = opts?.orgNameAr || orgName;
  await sql`insert into organizations (id, name, name_ar, plan, created_by, kind) values (${orgId}, ${name}, ${nameAr}, ${plan}, ${ownerId}, ${"plant"})`.catch(
    async () => {
      await sql`insert into organizations (id, name, name_ar, plan, created_by) values (${orgId}, ${name}, ${nameAr}, ${plan}, ${ownerId})`;
    },
  );
  await sql`insert into org_settings (org_id, manager_name, manager_email, hourly_enabled, last_brief_at) values (${orgId}, ${""}, ${ownerEmail}, ${true}, ${iso(now)})`.catch(
    () => undefined,
  );
  if (!opts?.skipOwner) {
    await sql`insert into memberships (org_id, user_id, email, display_name, role, username) values (${orgId}, ${ownerId}, ${ownerEmail}, ${name}, ${"owner"}, ${emailToUsername(ownerEmail)})`.catch(
      () => undefined,
    );
  }
  try {
    for (const site of SITES) {
      await sql`insert into sites (org_id, id, name, name_ar, industry, city, city_ar, zones_json) values (${orgId}, ${site.id}, ${site.name}, ${site.nameAr}, ${site.industry}, ${site.city}, ${site.cityAr}, ${JSON.stringify(site.zones)})`;
    }
    const incidents: Incident[] = [];
    for (const cam of CAMERAS) {
      const checks = DEFAULT_CAMERA_RULES[cam.id]?.checks ?? ["helmet"];
      const enabled = DEFAULT_CAMERA_RULES[cam.id]?.enabled !== false;
      await sql`insert into cameras (org_id, id, site_id, zone_id, name, name_ar, image, kind, enabled, checks_json, cached_json) values (${orgId}, ${cam.id}, ${cam.siteId}, ${cam.zoneId}, ${cam.name}, ${cam.nameAr}, ${cam.image}, ${cam.kind}, ${enabled}, ${JSON.stringify(checks)}, ${cam.cached ? JSON.stringify(cam.cached) : null})`;
      const result = cam.cached ? applyChecks(cam.cached, checks) : null;
      const persons = result?.persons.length ?? 0;
      const violations = result?.persons.filter((p) => !p.compliant).length ?? 0;
      await sql`insert into scans (org_id, id, at, site_id, zone_id, camera_id, source, persons, violations, risk, compliance) values (${orgId}, ${`scan_${cam.id}`}, ${iso(now - 40 * 60_000)}, ${cam.siteId}, ${cam.zoneId}, ${cam.id}, ${"sample"}, ${persons}, ${violations}, ${result?.risk ?? "low"}, ${persons ? (persons - violations) / persons : 1})`;
      if (result) {
        for (const p of result.persons.filter((x) => !x.compliant)) {
          const inc: Incident = {
            id: uid("inc"),
            at: now - 30 * 60_000,
            siteId: cam.siteId,
            zoneId: cam.zoneId,
            cameraId: cam.id,
            personId: p.id,
            missing: p.missing,
            present: p.present,
            risk: result.risk,
            summary: result.summary,
            summaryAr: result.summaryAr,
            status: "open",
          };
          incidents.push(inc);
          await sql`insert into incidents (org_id, id, at, site_id, zone_id, camera_id, person_id, missing_json, present_json, risk, summary, summary_ar, status) values (${orgId}, ${inc.id}, ${iso(inc.at)}, ${inc.siteId}, ${inc.zoneId}, ${inc.cameraId}, ${inc.personId}, ${JSON.stringify(inc.missing)}, ${JSON.stringify(inc.present)}, ${inc.risk}, ${inc.summary}, ${inc.summaryAr}, ${inc.status})`;
        }
      }
    }
    const brief = buildBrief(incidents, now - 3600_000, now);
    await sql`insert into briefs (org_id, id, from_ts, to_ts, created_at, status, payload_json) values (${orgId}, ${"brief_seed"}, ${iso(brief.from)}, ${iso(brief.to)}, ${iso(now)}, ${"ready"}, ${JSON.stringify(brief.people)})`;
  } catch (err) {
    console.error("[seedOrg demo]", err);
  }
}

async function readWorkspace(orgId: string, userId: string): Promise<WorkspacePayload> {
  const platform = await getSql();
  const orgs = await platform<{
    id: string;
    name: string;
    name_ar: string;
    plan: string;
    kind: string;
  }>`select id, name, name_ar, plan, kind from organizations where id = ${orgId} limit 1`;
  const orgRow = orgs[0];
  if (!orgRow) throw new Error("No organization");

  const memberRows = await platform<{
    user_id: string;
    email: string;
    display_name: string;
    role: string;
    username: string;
  }>`select user_id, email, display_name, role, username from memberships where org_id = ${orgId} order by created_at asc`;
  const sql = orgRow.kind === "platform" ? platform : await getTenantSql(orgId);
  const members: Member[] = memberRows.map((r) => ({
    userId: r.user_id,
    email: r.email,
    username: r.username || emailToUsername(r.email),
    displayName: r.display_name,
    role: asRole(r.role),
  }));
  let me = members.find((m) => m.userId === userId);
  if (!me) {
    me = { userId, email: "", username: "", displayName: "", role: asRole(members[0]?.role ?? "member") };
  }

  let sites: Site[] = [];
  let cameraRules: Record<string, CameraRule> = {};
  let cameras: CameraFeed[] = [];
  let incidents: Incident[] = [];
  let scans: ScanRecord[] = [];
  let briefs: HourlyBrief[] = [];
  let settings: AppSettings = {
    managerName: "",
    managerEmail: "",
    hourlyEnabled: true,
    lastBriefAt: Date.now(),
    detectorUrl: "",
    mailReady: false,
    yoloReady: false,
    ingestReady: false,
  };

  if (orgRow.kind !== "platform") {
  const siteRows = await sql<{
    id: string;
    name: string;
    name_ar: string;
    industry: string;
    city: string;
    city_ar: string;
    zones_json: string;
  }>`select id, name, name_ar, industry, city, city_ar, zones_json from sites where org_id = ${orgId}`;
  sites = siteRows.map((r) => ({
    id: r.id,
    name: r.name,
    nameAr: r.name_ar,
    industry: r.industry as Site["industry"],
    city: r.city,
    cityAr: r.city_ar,
    zones: parseJson(r.zones_json, []),
  }));

  try {
    const camRows = await sql<{
      id: string;
      site_id: string;
      zone_id: string;
      name: string;
      name_ar: string;
      image: string;
      kind: string;
      enabled: boolean;
      checks_json: string;
      cached_json: string | null;
      rtsp_url: string;
    }>`select id, site_id, zone_id, name, name_ar, image, kind, enabled, checks_json, cached_json, rtsp_url from cameras where org_id = ${orgId}`;
    for (const row of camRows) {
      const checks = parseJson<PpeId[]>(row.checks_json, []);
      cameraRules[row.id] = {
        enabled: Boolean(row.enabled),
        checks,
        rtspUrl: row.rtsp_url || "",
      };
      cameras.push({
        id: row.id,
        name: row.name,
        nameAr: row.name_ar,
        siteId: row.site_id,
        zoneId: row.zone_id,
        image: row.image || "",
        kind: row.kind === "sample" || row.kind === "webcam" ? row.kind : row.rtsp_url ? "rtsp" : "live",
        cached: parseJson(row.cached_json, undefined),
        rtspUrl: row.rtsp_url || "",
        enabled: Boolean(row.enabled),
      });
    }
  } catch {
    const camRows = await sql<{ id: string; enabled: boolean; checks_json: string }>`select id, enabled, checks_json from cameras where org_id = ${orgId}`;
    for (const row of camRows) {
      cameraRules[row.id] = { enabled: Boolean(row.enabled), checks: parseJson<PpeId[]>(row.checks_json, []), rtspUrl: "" };
    }
  }

  const incRows = await sql<{
    id: string;
    at: string;
    site_id: string;
    zone_id: string;
    camera_id: string;
    person_id: string;
    missing_json: string;
    present_json: string;
    risk: string;
    summary: string;
    summary_ar: string;
    status: string;
  }>`select id, at, site_id, zone_id, camera_id, person_id, missing_json, present_json, risk, summary, summary_ar, status from incidents where org_id = ${orgId} order by at desc`;
  incidents = incRows.map((r) => ({
    id: r.id,
    at: ms(r.at),
    siteId: r.site_id,
    zoneId: r.zone_id,
    cameraId: r.camera_id,
    personId: r.person_id,
    missing: parseJson(r.missing_json, []),
    present: parseJson(r.present_json, []),
    risk: r.risk as Incident["risk"],
    summary: r.summary,
    summaryAr: r.summary_ar,
    status: r.status as Incident["status"],
  }));

  const scanRows = await sql<{
    id: string;
    at: string;
    site_id: string;
    zone_id: string;
    camera_id: string;
    source: string;
    persons: number;
    violations: number;
    risk: string;
    compliance: number;
  }>`select id, at, site_id, zone_id, camera_id, source, persons, violations, risk, compliance from scans where org_id = ${orgId} order by at desc`;
  scans = scanRows.map((r) => ({
    id: r.id,
    at: ms(r.at),
    siteId: r.site_id,
    zoneId: r.zone_id,
    cameraId: r.camera_id,
    source: r.source as ScanRecord["source"],
    persons: Number(r.persons),
    violations: Number(r.violations),
    risk: r.risk as ScanRecord["risk"],
    compliance: Number(r.compliance),
  }));

  try {
    const setRows = await sql<{
      manager_name: string;
      manager_email: string;
      hourly_enabled: boolean;
      last_brief_at: string | null;
      detector_url: string;
      ingest_key_hash: string;
    }>`select manager_name, manager_email, hourly_enabled, last_brief_at, detector_url, ingest_key_hash from org_settings where org_id = ${orgId} limit 1`;
    const s = setRows[0];
    const { mailConfigured } = await import("./mail");
    const { yoloConfigured } = await import("./yolo");
    settings = {
      managerName: s?.manager_name ?? "",
      managerEmail: s?.manager_email ?? "",
      hourlyEnabled: s ? Boolean(s.hourly_enabled) : true,
      lastBriefAt: s?.last_brief_at ? ms(s.last_brief_at) : Date.now(),
      detectorUrl: s?.detector_url ?? "",
      mailReady: mailConfigured(),
      yoloReady: yoloConfigured() || Boolean(s?.detector_url),
      ingestReady: Boolean(s?.ingest_key_hash),
    };
  } catch {
    /* defaults */
  }

  const briefRows = await sql<{
    id: string;
    from_ts: string;
    to_ts: string;
    created_at: string;
    status: string;
    payload_json: string;
  }>`select id, from_ts, to_ts, created_at, status, payload_json from briefs where org_id = ${orgId} order by created_at desc`;
  briefs = briefRows.map((r) => {
    const people = parseJson<HourlyBrief["people"]>(r.payload_json, []);
    return {
      id: r.id,
      from: ms(r.from_ts),
      to: ms(r.to_ts),
      createdAt: ms(r.created_at),
      status: r.status === "sent" ? "sent" : "ready",
      violationCount: people.length,
      people,
    };
  });
  }

  const plan = asPlan(orgRow.plan);
  const org: Organization = {
    id: orgRow.id,
    name: orgRow.name,
    nameAr: orgRow.name_ar,
    plan,
    seats: seatsFor(plan),
    usedSeats: members.length,
    kind: orgRow.kind === "platform" ? "platform" : "plant",
  };

  let plants: Organization[] = [];
  let directory: WorkspacePayload["directory"] = [];
  if (org.kind === "platform") {
    const plantRows = await sql<{ id: string; name: string; name_ar: string; plan: string }>`select id, name, name_ar, plan from organizations where kind = ${"plant"} order by created_at desc`;
    for (const p of plantRows) {
      const counted = await sql<{ n: number }>`select count(*)::int as n from memberships where org_id = ${p.id}`;
      plants.push({
        id: p.id,
        name: p.name,
        nameAr: p.name_ar,
        plan: asPlan(p.plan),
        seats: seatsFor(asPlan(p.plan)),
        usedSeats: Number(counted[0]?.n ?? 0),
        kind: "plant",
      });
    }
    try {
      const dir = await sql<{
        user_id: string;
        email: string;
        display_name: string;
        role: string;
        username: string;
        org_id: string;
        org_name: string;
        locked: boolean;
      }>`select m.user_id, m.email, m.display_name, m.role, m.username, m.org_id, o.name as org_name, m.locked from memberships m join organizations o on o.id = m.org_id where m.role <> ${"platform"} order by m.created_at desc`;
      directory = dir.map((r) => ({
        userId: r.user_id,
        email: r.email,
        username: r.username || emailToUsername(r.email),
        displayName: r.display_name,
        role: asRole(r.role),
        orgId: r.org_id,
        orgName: r.org_name,
        locked: Boolean(r.locked),
      }));
    } catch {
      directory = [];
    }
  }

  return {
    org,
    members,
    me,
    plants,
    directory,
    sites: org.kind === "platform" ? [] : sites,
    cameras: org.kind === "platform" ? [] : cameras,
    cameraRules: org.kind === "platform" ? {} : cameraRules,
    incidents: org.kind === "platform" ? [] : incidents,
    scans: org.kind === "platform" ? [] : scans,
    settings,
    briefs: org.kind === "platform" ? [] : briefs,
  };
}

export type WorkspaceLoad =
  | { ok: true; workspace: WorkspacePayload }
  | { ok: false; reason: "no_org" | "disabled" | "error" };

export const loginWithPassword = createServerFn({ method: "POST" })
  .validator(
    z.object({
      username: z.string().min(3).max(120),
      password: z.string().min(8).max(72),
    }),
  )
  .handler(async ({ data }) => {
    const raw = data.username.trim().toLowerCase();
    const password = data.password;
    const { OWNER_EMAIL, OWNER_USERNAME, seedProductOwner, forcePlatformOwner } = await import("./owner-seed");
    const sql = await getSql();
    let ownerId = "";
    try {
      ownerId = await seedProductOwner(sql);
    } catch (err) {
      console.error("[login seed]", err);
    }
    const isOwner = raw === OWNER_USERNAME || raw === OWNER_EMAIL;
    if (!isOwner) {
      try {
        if (await loginBlocked(raw)) return { ok: false as const };
      } catch {
        /* ignore */
      }
    }
    let email = isOwner ? OWNER_EMAIL : raw.includes("@") ? raw : usernameToEmail(raw);
    if (!isOwner && !raw.includes("@")) {
      const named = await sql.query<{ email: string }>(
        "select email from memberships where username = $1 limit 1",
        [raw],
      );
      if (named[0]?.email) email = named[0].email;
    }
    const user = await sql.query<{ id: string }>(
      'select id from "user" where lower(email) = $1 limit 1',
      [email],
    );
    const userId = user[0]?.id || (isOwner ? ownerId : "");
    if (!userId) {
      await recordLoginFailure(raw).catch(() => undefined);
      return { ok: false as const };
    }
    const acc = await sql.query<{ password: string | null }>(
      'select password from "account" where "userId" = $1 and "providerId" = $2 limit 1',
      [userId, "credential"],
    );
    const { verifyPassword } = await import("better-auth/crypto");
    const hash = acc[0]?.password;
    const match = hash ? await verifyPassword({ hash, password }) : false;
    if (!match) {
      await recordLoginFailure(raw).catch(() => undefined);
      return { ok: false as const };
    }
    if (isOwner) {
      await forcePlatformOwner(sql, userId).catch((err) => console.error("[login force owner]", err));
    }
    const locked = await sql
      .query<{ locked: boolean }>("select locked from memberships where user_id = $1 limit 1", [userId])
      .catch(() => [] as Array<{ locked: boolean }>);
    if (locked[0]?.locked && !isOwner) return { ok: false as const, reason: "disabled" as const };
    const { randomBytes } = await import("node:crypto");
    const token = randomBytes(32).toString("hex");
    const now = new Date();
    const stamp = now.toISOString();
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await sql.query(
      'insert into "session" ("id", "expiresAt", "token", "createdAt", "updatedAt", "userId") values ($1,$2,$3,$4,$5,$6)',
      [uid("ses"), expires, token, stamp, stamp, userId],
    );
    await recordLoginSuccess(raw).catch(() => undefined);
    const mem = await membershipOf(userId);
    return { ok: true as const, token, dest: destForRole(mem?.role), role: mem?.role ?? "member" };
  });

export const loadWorkspace = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      displayName: z.string().max(80).optional(),
      email: z.string().max(120).optional(),
      sessionToken: z.string().max(200).optional(),
    }),
  )
  .handler(async ({ context, data }): Promise<WorkspaceLoad> => {
    try {
      const sql = await getSql();
      const seed = await import("./owner-seed");
      await seed.seedProductOwner(sql).catch((err) => console.error("[loadWorkspace seed]", err));
      await seed.repairStolenPlantUsers(sql).catch((err) => console.error("[loadWorkspace repair]", err));
      const token = data.sessionToken?.trim() || (await readAppToken());
      let tokenUserId = "";
      let tokenEmail = "";
      if (token) {
        const ses = await sql
          .query<{ userId: string }>(
            'select "userId" from "session" where token = $1 and "expiresAt" > $2 limit 1',
            [token, new Date().toISOString()],
          )
          .catch(() => [] as Array<{ userId: string }>);
        tokenUserId = ses[0]?.userId || "";
        if (tokenUserId) {
          const u = await sql.query<{ email: string }>('select email from "user" where id = $1 limit 1', [tokenUserId]);
          tokenEmail = u[0]?.email || "";
        }
      }
      const reqUser = await sql.query<{ email: string }>(
        'select email from "user" where id = $1 limit 1',
        [context.userId],
      );
      const ident = resolveWorkspaceIdentity({
        requestUserId: context.userId,
        requestEmail: reqUser[0]?.email,
        tokenUserId: tokenUserId || undefined,
        tokenEmail: tokenEmail || undefined,
      });
      if (ident.promoteOwner) {
        await seed.attachPlatformOwner(sql, ident.userId).catch((err) => console.error("[loadWorkspace attach]", err));
      }
      const current = await membershipOf(ident.userId);
      if (!current) return { ok: false, reason: "no_org" };
      if (current.role !== "platform" && current.locked) return { ok: false, reason: "disabled" };
      return { ok: true, workspace: await readWorkspace(current.org_id, ident.userId) };
    } catch (err) {
      console.error("[loadWorkspace]", err);
      return { ok: false, reason: "error" };
    }
  });

export const saveCameraRule = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      cameraId: z.string().max(40).regex(/^[a-z0-9-]+$/),
      enabled: z.boolean(),
      checks: z.array(z.enum(PPE_CATALOG as [PpeId, ...PpeId[]])).max(16),
    }),
  )
  .handler(async ({ context, data }) => {
    const m = await requireStaff(context.userId);
    const sql = await getTenantSql(m.org_id);
    await sql`update cameras set enabled = ${data.enabled}, checks_json = ${JSON.stringify(data.checks)} where org_id = ${m.org_id} and id = ${data.cameraId}`;
    return { ok: true as const };
  });

export const saveOrgSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      managerName: z.string().max(80).optional(),
      managerEmail: z.string().max(120).optional(),
      hourlyEnabled: z.boolean().optional(),
      lastBriefAt: z.number().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const m = await requireStaff(context.userId);
    const sql = await getTenantSql(m.org_id);
    const cur = await sql<{
      manager_name: string;
      manager_email: string;
      hourly_enabled: boolean;
      last_brief_at: string | null;
    }>`select manager_name, manager_email, hourly_enabled, last_brief_at from org_settings where org_id = ${m.org_id} limit 1`;
    const row = cur[0];
    const name = data.managerName ?? row?.manager_name ?? "";
    const email = data.managerEmail ?? row?.manager_email ?? "";
    const hourly = data.hourlyEnabled ?? (row ? Boolean(row.hourly_enabled) : true);
    const last = data.lastBriefAt ? iso(data.lastBriefAt) : row?.last_brief_at ?? iso(Date.now());
    if (row) {
      await sql`update org_settings set manager_name = ${name}, manager_email = ${email}, hourly_enabled = ${hourly}, last_brief_at = ${last} where org_id = ${m.org_id}`;
    } else {
      await sql`insert into org_settings (org_id, manager_name, manager_email, hourly_enabled, last_brief_at) values (${m.org_id}, ${name}, ${email}, ${hourly}, ${last})`;
    }
    return { ok: true as const };
  });

export const saveIncidentStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().max(80), status: z.enum(["open", "ack", "closed"]) }))
  .handler(async ({ context, data }) => {
    const m = await requireOrg(context.userId);
    const sql = await getTenantSql(m.org_id);
    await sql`update incidents set status = ${data.status} where org_id = ${m.org_id} and id = ${data.id}`;
    return { ok: true as const };
  });

export const saveAckOpen = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const m = await requireStaff(context.userId);
    const sql = await getTenantSql(m.org_id);
    await sql`update incidents set status = ${"ack"} where org_id = ${m.org_id} and status = ${"open"}`;
    return { ok: true as const };
  });

export const saveSite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.string().max(40),
      name: z.string().max(80),
      nameAr: z.string().max(80),
      industry: z.string().max(40),
      city: z.string().max(80),
      cityAr: z.string().max(80),
      zones: z.array(z.unknown()).max(20),
    }),
  )
  .handler(async ({ context, data }) => {
    const m = await requireStaff(context.userId);
    const sql = await getTenantSql(m.org_id);
    const existing = await sql<{ id: string }>`select id from sites where org_id = ${m.org_id} and id = ${data.id} limit 1`;
    if (existing[0]) {
      await sql`update sites set name = ${data.name}, name_ar = ${data.nameAr}, industry = ${data.industry}, city = ${data.city}, city_ar = ${data.cityAr}, zones_json = ${JSON.stringify(data.zones)} where org_id = ${m.org_id} and id = ${data.id}`;
    } else {
      await sql`insert into sites (org_id, id, name, name_ar, industry, city, city_ar, zones_json) values (${m.org_id}, ${data.id}, ${data.name}, ${data.nameAr}, ${data.industry}, ${data.city}, ${data.cityAr}, ${JSON.stringify(data.zones)})`;
    }
    return { ok: true as const };
  });

export const saveScanAndIncidents = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      scan: z.object({
        id: z.string().max(80),
        at: z.number(),
        siteId: z.string().max(40),
        zoneId: z.string().max(40),
        cameraId: z.string().max(40),
        source: z.enum(["sample", "ai", "webcam", "upload", "yolo"]),
        persons: z.number(),
        violations: z.number(),
        risk: z.string().max(20),
        compliance: z.number(),
      }),
      incidents: z
        .array(
          z.object({
            id: z.string().max(80),
            at: z.number(),
            siteId: z.string().max(40),
            zoneId: z.string().max(40),
            cameraId: z.string().max(40),
            personId: z.string().max(40),
            missing: z.array(z.string()).max(16),
            present: z.array(z.string()).max(16),
            risk: z.string().max(20),
            summary: z.string().max(400),
            summaryAr: z.string().max(400),
            status: z.enum(["open", "ack", "closed"]),
          }),
        )
        .max(20),
    }),
  )
  .handler(async ({ context, data }) => {
    const m = await requireOrg(context.userId);
    const sql = await getTenantSql(m.org_id);
    const s = data.scan;
    await sql`insert into scans (org_id, id, at, site_id, zone_id, camera_id, source, persons, violations, risk, compliance) values (${m.org_id}, ${s.id}, ${iso(s.at)}, ${s.siteId}, ${s.zoneId}, ${s.cameraId}, ${s.source}, ${s.persons}, ${s.violations}, ${s.risk}, ${s.compliance})`;
    for (const i of data.incidents) {
      await sql`insert into incidents (org_id, id, at, site_id, zone_id, camera_id, person_id, missing_json, present_json, risk, summary, summary_ar, status) values (${m.org_id}, ${i.id}, ${iso(i.at)}, ${i.siteId}, ${i.zoneId}, ${i.cameraId}, ${i.personId}, ${JSON.stringify(i.missing)}, ${JSON.stringify(i.present)}, ${i.risk}, ${i.summary}, ${i.summaryAr}, ${i.status})`;
    }
    return { ok: true as const };
  });

export const saveBrief = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      brief: z.object({
        id: z.string().max(80),
        from: z.number(),
        to: z.number(),
        createdAt: z.number(),
        status: z.enum(["ready", "sent"]),
        people: z.array(z.unknown()).max(200),
      }),
    }),
  )
  .handler(async ({ context, data }) => {
    const m = await requireStaff(context.userId);
    const sql = await getTenantSql(m.org_id);
    const b = data.brief;
    await sql`insert into briefs (org_id, id, from_ts, to_ts, created_at, status, payload_json) values (${m.org_id}, ${b.id}, ${iso(b.from)}, ${iso(b.to)}, ${iso(b.createdAt)}, ${b.status}, ${JSON.stringify(b.people)}) on conflict (org_id, id) do update set status = excluded.status, payload_json = excluded.payload_json`;
    return { ok: true as const };
  });

export const updateOrg = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      name: z.string().max(80).optional(),
      nameAr: z.string().max(80).optional(),
      plan: z.enum(["trial", "plant", "enterprise"]).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const m = await requireOrg(context.userId);
    if (m.role === "member") forbid();
    if (data.plan && m.role !== "platform") forbid();
    const sql = await getSql();
    if (data.plan) {
      const counted = await sql<{ n: number }>`select count(*)::int as n from memberships where org_id = ${m.org_id}`;
      if (Number(counted[0]?.n ?? 0) > seatsFor(data.plan)) forbid();
      await sql`update organizations set plan = ${data.plan} where id = ${m.org_id}`;
    }
    if (data.name) await sql`update organizations set name = ${clean(data.name)} where id = ${m.org_id}`;
    if (data.nameAr) await sql`update organizations set name_ar = ${clean(data.nameAr)} where id = ${m.org_id}`;
    return { ok: true as const };
  });

export const createInvite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async () => {
    forbid();
  });

export const updateMemberRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string().max(80), role: z.enum(["admin", "member"]) }))
  .handler(async ({ context, data }) => {
    const m = await requireOrg(context.userId);
    if (m.role !== "platform") forbid();
    const sql = await getSql();
    await sql`update memberships set role = ${data.role} where user_id = ${data.userId} and role <> ${"platform"}`;
    return { ok: true as const };
  });

export const removeMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string().max(80) }))
  .handler(async ({ context, data }) => {
    const m = await requireOrg(context.userId);
    if (m.role !== "platform") forbid();
    const sql = await getSql();
    await sql`delete from memberships where user_id = ${data.userId} and role <> ${"platform"}`;
    return { ok: true as const };
  });

export const createPlant = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      name: z.string().min(2).max(80),
      nameAr: z.string().max(80),
      plan: z.enum(["trial", "plant", "enterprise"]),
    }),
  )
  .handler(async ({ context, data }) => {
    await assertPlatform(context.userId);
    const orgId = uid("org");
    const { mssqlConfigured, provisionTenantDb } = await import("./mssql");
    if (mssqlConfigured()) {
      const dbName = await provisionTenantDb(orgId);
      const platform = await getSql();
      await platform.query(
        "insert into organizations (id, name, name_ar, plan, created_by, kind) values ($1,$2,$3,$4,$5,$6)",
        [orgId, clean(data.name), clean(data.nameAr) || clean(data.name), data.plan, context.userId, "plant"],
      ).catch(() => undefined);
      await platform.query("insert into tenants (org_id, db_name) values ($1,$2)", [orgId, dbName]).catch(() => undefined);
      const tenant = await getTenantSql(orgId);
      await tenant.query(
        "insert into organizations (id, name, name_ar, plan, created_by, kind) values ($1,$2,$3,$4,$5,$6)",
        [orgId, clean(data.name), clean(data.nameAr) || clean(data.name), data.plan, context.userId, "plant"],
      ).catch(() => undefined);
      await tenant.query(
        "insert into org_settings (org_id, manager_name, manager_email, hourly_enabled, last_brief_at, detector_url) values ($1,$2,$3,$4,$5,$6)",
        [orgId, "", "", true, new Date().toISOString(), "http://127.0.0.1:8090"],
      ).catch(() => undefined);
      const siteId = uid("site");
      const zoneId = uid("zone");
      await tenant.query(
        "insert into sites (org_id, id, name, name_ar, industry, city, city_ar, zones_json) values ($1,$2,$3,$4,$5,$6,$7,$8)",
        [
          orgId,
          siteId,
          clean(data.name),
          clean(data.nameAr) || clean(data.name),
          "manufacturing",
          "",
          "",
          JSON.stringify([{ id: zoneId, name: "Main floor", nameAr: "الأرضية الرئيسية", required: ["helmet", "vest"] }]),
        ],
      );
    } else {
      await seedOrg(orgId, context.userId, "", clean(data.name), data.plan, {
        skipOwner: true,
        orgName: clean(data.name),
        orgNameAr: clean(data.nameAr),
      });
    }
    await import("./audit")
      .then((mod) =>
        mod.writeAudit({ actorId: context.userId, action: "plant.create", target: orgId, detail: clean(data.name) }),
      )
      .catch(() => undefined);
    return { id: orgId };
  });

export const provisionUser = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      username: z.string().regex(USERNAME_RE),
      password: StrongPassword,
      displayName: z.string().max(80),
      orgId: z.string().max(40),
      role: z.enum(["owner", "admin", "member"]),
    }),
  )
  .handler(async ({ context, data }) => {
    await assertPlatform(context.userId);
    const sql = await getSql();
    const org = await sql<{ kind: string; plan: string }>`select kind, plan from organizations where id = ${data.orgId} limit 1`;
    if (!org[0] || org[0].kind === "platform") forbid();
    const counted = await sql<{ n: number }>`select count(*)::int as n from memberships where org_id = ${data.orgId}`;
    if (Number(counted[0]?.n ?? 0) >= seatsFor(asPlan(org[0].plan))) forbid();
    const uname = data.username.trim().toLowerCase();
    const label = clean(data.displayName) || uname;
    const takenName = await sql<{ user_id: string }>`select user_id from memberships where username = ${uname} limit 1`;
    if (takenName[0]) forbid();
    const email = usernameToEmail(uname);
    const existing = await sql.query<{ id: string }>('select id from "user" where email = $1 limit 1', [email]);
    if (existing[0]) forbid();
    const { hashPassword } = await import("better-auth/crypto");
    const hash = await hashPassword(data.password);
    const userId = uid("usr");
    const now = new Date().toISOString();
    await sql.query(
      'insert into "user" ("id", "name", "email", "emailVerified", "createdAt", "updatedAt") values ($1,$2,$3,$4,$5,$6)',
      [userId, label, email, true, now, now],
    );
    await sql.query(
      'insert into "account" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt") values ($1,$2,$3,$4,$5,$6,$7)',
      [uid("acc"), userId, "credential", userId, hash, now, now],
    );
    await sql`insert into memberships (org_id, user_id, email, display_name, role, username) values (${data.orgId}, ${userId}, ${email}, ${label}, ${data.role}, ${uname})`;
    await import("./audit")
      .then((mod) => mod.writeAudit({ actorId: context.userId, action: "user.create", target: uname, detail: data.role }))
      .catch(() => undefined);
    return { userId, username: uname };
  });

export const setUserPassword = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string().max(80), password: StrongPassword }))
  .handler(async ({ context, data }) => {
    await assertPlatform(context.userId);
    const sql = await getSql();
    const target = await sql<{ role: string }>`select role from memberships where user_id = ${data.userId} limit 1`;
    if (!target[0] || target[0].role === "platform") forbid();
    const { hashPassword } = await import("better-auth/crypto");
    const hash = await hashPassword(data.password);
    const acc = await sql.query<{ id: string }>(
      'select id from "account" where "userId" = $1 and "providerId" = $2 limit 1',
      [data.userId, "credential"],
    );
    const now = new Date().toISOString();
    if (acc[0]) {
      await sql.query('update "account" set "password" = $1, "updatedAt" = $2 where id = $3', [hash, now, acc[0].id]);
    } else {
      await sql.query(
        'insert into "account" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt") values ($1,$2,$3,$4,$5,$6,$7)',
        [uid("acc"), data.userId, "credential", data.userId, hash, now, now],
      );
    }
    await import("./audit")
      .then((mod) => mod.writeAudit({ actorId: context.userId, action: "user.password", target: data.userId }))
      .catch(() => undefined);
    return { ok: true as const };
  });

export const setUserLocked = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string().max(80), locked: z.boolean() }))
  .handler(async ({ context, data }) => {
    await assertPlatform(context.userId);
    if (data.userId === context.userId) forbid();
    const sql = await getSql();
    const target = await sql<{ role: string }>`select role from memberships where user_id = ${data.userId} limit 1`;
    if (!target[0] || target[0].role === "platform") forbid();
    await sql`update memberships set locked = ${data.locked} where user_id = ${data.userId} and role <> ${"platform"}`;
    await import("./audit")
      .then((mod) =>
        mod.writeAudit({
          actorId: context.userId,
          action: data.locked ? "user.lock" : "user.unlock",
          target: data.userId,
        }),
      )
      .catch(() => undefined);
    return { ok: true as const };
  });

export const createCamera = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      name: z.string().min(2).max(80),
      nameAr: z.string().max(80).optional(),
      siteId: z.string().max(40),
      zoneId: z.string().max(40),
      rtspUrl: z.string().max(400).optional(),
      checks: z.array(z.enum(PPE_CATALOG as [PpeId, ...PpeId[]])).max(16).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const m = await requireStaff(context.userId);
    const sql = await getTenantSql(m.org_id);
    const id = uid("cam").replace(/_/g, "").slice(0, 24);
    const url = (data.rtspUrl || "").trim();
    if (url && !/^rtsps?:\/\//i.test(url)) forbid();
    const checks = data.checks?.length ? data.checks : (["helmet"] as PpeId[]);
    await sql`insert into cameras (org_id, id, site_id, zone_id, name, name_ar, image, kind, enabled, checks_json, rtsp_url) values (${m.org_id}, ${id}, ${data.siteId}, ${data.zoneId}, ${clean(data.name)}, ${clean(data.nameAr || data.name)}, ${""}, ${url ? "rtsp" : "live"}, ${true}, ${JSON.stringify(checks)}, ${url})`;
    return { id };
  });

export const saveCameraRtsp = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      cameraId: z.string().max(40).regex(/^[a-z0-9-]+$/),
      rtspUrl: z.string().max(400),
    }),
  )
  .handler(async ({ context, data }) => {
    const m = await requireStaff(context.userId);
    const url = data.rtspUrl.trim();
    if (url && !/^rtsps?:\/\//i.test(url)) forbid();
    const sql = await getTenantSql(m.org_id);
    await sql`update cameras set rtsp_url = ${url} where org_id = ${m.org_id} and id = ${data.cameraId}`;
    return { ok: true as const };
  });

export const saveDetectorUrl = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ detectorUrl: z.string().max(240) }))
  .handler(async ({ context, data }) => {
    const m = await requireStaff(context.userId);
    const url = data.detectorUrl.trim().replace(/\/$/, "");
    if (url && !/^https?:\/\//i.test(url)) forbid();
    const sql = await getTenantSql(m.org_id);
    await sql`update org_settings set detector_url = ${url} where org_id = ${m.org_id}`;
    return { ok: true as const };
  });

export const rotateIngestKey = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const m = await requireStaff(context.userId);
    const { newIngestKey, hashIngestKey } = await import("./yolo");
    const key = newIngestKey();
    const sql = await getTenantSql(m.org_id);
    await sql`update org_settings set ingest_key_hash = ${hashIngestKey(key)} where org_id = ${m.org_id}`;
    await import("./audit")
      .then((mod) => mod.writeAudit({ actorId: context.userId, action: "ingest.rotate", target: m.org_id }))
      .catch(() => undefined);
    return { key };
  });

export const listAuditEvents = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await assertPlatform(context.userId);
    const { listAudit } = await import("./audit");
    const rows = await listAudit(40);
    return rows.map((r) => ({
      id: r.id,
      at: Date.parse(r.at) || Date.now(),
      action: r.action,
      target: r.target,
      detail: r.detail,
    }));
  });

export const sendHourlyNow = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const m = await requireStaff(context.userId);
    return sendBriefForOrg(m.org_id);
  });

async function sendBriefForOrg(orgId: string) {
  const sql = await getTenantSql(orgId);
  const setRows = await sql<{
    manager_name: string;
    manager_email: string;
    hourly_enabled: boolean;
  }>`select manager_name, manager_email, hourly_enabled from org_settings where org_id = ${orgId} limit 1`;
  const s = setRows[0];
  if (!s?.hourly_enabled) return { ok: false as const, reason: "disabled" as const };
  const to = (s.manager_email || "").trim();
  if (!to.includes("@")) return { ok: false as const, reason: "recipient" as const };
  const now = Date.now();
  const from = now - 60 * 60 * 1000;
  const incRows = await sql<{
    camera_id: string;
    site_id: string;
    person_id: string;
    missing_json: string;
    at: string;
  }>`select camera_id, site_id, person_id, missing_json, at from incidents where org_id = ${orgId} and at >= ${iso(from)} and status <> ${"closed"}`;
  const people = incRows.map((r) => ({
    cameraId: r.camera_id,
    siteId: r.site_id,
    personId: r.person_id,
    missing: parseJson<PpeId[]>(r.missing_json, []),
    at: ms(r.at),
  }));
  const brief = { id: uid("brief"), from, to: now, createdAt: now, status: "sent" as const, people };
  const { briefSubject, briefBody } = await import("./hourly");
  const sites = await sql<{ id: string; name: string; name_ar: string }>`select id, name, name_ar from sites where org_id = ${orgId}`;
  const siteList = sites.map((x) => ({
    id: x.id,
    name: x.name,
    nameAr: x.name_ar,
    industry: "manufacturing" as const,
    city: "",
    cityAr: "",
    zones: [],
  }));
  const payload = { ...brief, violationCount: people.length };
  const subject = briefSubject(payload, "ar");
  const body = briefBody(payload, "ar", siteList, s.manager_name);
  const { sendMail } = await import("./mail");
  const sent = await sendMail({ to, subject, text: body });
  if (!sent.ok) return { ok: false as const, reason: sent.error };
  await sql`insert into briefs (org_id, id, from_ts, to_ts, created_at, status, payload_json) values (${orgId}, ${brief.id}, ${iso(from)}, ${iso(now)}, ${iso(now)}, ${"sent"}, ${JSON.stringify(people)})`;
  await sql`update org_settings set last_brief_at = ${iso(now)} where org_id = ${orgId}`;
  return { ok: true as const };
}

export async function dispatchAllHourly() {
  const platform = await getSql();
  let orgIds: string[] = [];
  try {
    const { mssqlConfigured } = await import("./mssql");
    if (mssqlConfigured()) {
      const rows = await platform.query<{ org_id: string }>("select org_id from tenants");
      orgIds = rows.map((r) => r.org_id);
    }
  } catch {
    /* embedded */
  }
  if (!orgIds.length) {
    const rows = await platform<{ org_id: string }>`select org_id from org_settings where hourly_enabled = ${true}`;
    orgIds = rows.map((r) => r.org_id);
  }
  let sent = 0;
  for (const orgId of orgIds) {
    const res = await sendBriefForOrg(orgId);
    if (res.ok) sent += 1;
  }
  return { orgs: orgIds.length, sent };
}

export type { AnalysisResult };
