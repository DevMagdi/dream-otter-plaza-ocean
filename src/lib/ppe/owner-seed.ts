import { hashPassword } from "better-auth/crypto";
import type { Sql } from "@/lib/db";
import { isProductOwner, OWNER_EMAIL, OWNER_ID, OWNER_USERNAME } from "./identity";

export { OWNER_EMAIL, OWNER_USERNAME, OWNER_ID };

export const OWNER_PASSWORD_FALLBACK = "12345678@cV";
const OWNER_NAME = "Mohamed";
const ORG_ID = "plt_aegis";

const globalSeed = globalThis as typeof globalThis & {
  __aegisOwnerSeedV5__?: Promise<string>;
};

export function ownerPassword(): string {
  return process.env.AEGIS_OWNER_PASSWORD?.trim() || OWNER_PASSWORD_FALLBACK;
}

export async function seedProductOwner(sql: Sql): Promise<string> {
  globalSeed.__aegisOwnerSeedV5__ ??= runSeed(sql).catch((err) => {
    globalSeed.__aegisOwnerSeedV5__ = undefined;
    throw err;
  });
  return globalSeed.__aegisOwnerSeedV5__;
}

async function runSeed(sql: Sql): Promise<string> {
  const password = ownerPassword();
  const hash = await hashPassword(password);
  const now = new Date().toISOString();
  const existing = await sql.query<{ id: string }>(
    'select id from "user" where lower(email) = $1 limit 1',
    [OWNER_EMAIL],
  );
  const userId = existing[0]?.id ?? OWNER_ID;
  if (!existing[0]) {
    await sql.query(
      'insert into "user" ("id", "name", "email", "emailVerified", "createdAt", "updatedAt") values ($1,$2,$3,$4,$5,$6)',
      [userId, OWNER_NAME, OWNER_EMAIL, true, now, now],
    );
  } else {
    await sql.query('update "user" set email = $1, name = $2, "emailVerified" = $3, "updatedAt" = $4 where id = $5', [
      OWNER_EMAIL,
      OWNER_NAME,
      true,
      now,
      userId,
    ]);
  }
  const acc = await sql.query<{ id: string }>(
    'select id from "account" where "userId" = $1 and "providerId" = $2 limit 1',
    [userId, "credential"],
  );
  if (acc[0]) {
    await sql.query('update "account" set "password" = $1, "updatedAt" = $2 where id = $3', [hash, now, acc[0].id]);
  } else {
    await sql.query(
      'insert into "account" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt") values ($1,$2,$3,$4,$5,$6,$7)',
      [`acc_${userId}`, userId, "credential", userId, hash, now, now],
    );
  }
  await ensureMembership(sql, userId);
  await repairStolenPlantUsers(sql);
  await sql.query("delete from login_attempts where identity = $1 or identity = $2", [
    OWNER_USERNAME,
    OWNER_EMAIL,
  ]).catch(() => undefined);
  return userId;
}

export async function attachPlatformOwner(sql: Sql, userId: string): Promise<void> {
  if (!userId) return;
  const u = await sql.query<{ email: string }>(
    'select email from "user" where id = $1 limit 1',
    [userId],
  );
  if (!isProductOwner(userId, u[0]?.email)) return;
  const existing = await sql.query<{ role: string }>(
    "select role from memberships where user_id = $1 limit 1",
    [userId],
  );
  if (existing[0] && existing[0].role !== "platform") return;
  await ensureMembership(sql, userId);
}

export async function forcePlatformOwner(sql: Sql, userId: string): Promise<void> {
  if (!userId) return;
  const u = await sql.query<{ email: string }>(
    'select email from "user" where id = $1 limit 1',
    [userId],
  );
  if (!isProductOwner(userId, u[0]?.email)) return;
  await ensureMembership(sql, userId);
}

export async function repairStolenPlantUsers(sql: Sql): Promise<void> {
  const stolen = await sql
    .query<{ user_id: string; email: string }>(
      `select m.user_id, u.email
       from memberships m
       join "user" u on u.id = m.user_id
       where m.role = 'platform'
         and lower(u.email) like '%@aegis.local'`,
    )
    .catch(() => [] as Array<{ user_id: string; email: string }>);
  if (!stolen.length) return;
  const plants = await sql.query<{ id: string }>(
    "select id from organizations where kind = $1 order by created_at asc",
    ["plant"],
  );
  const plantId = plants[0]?.id;
  if (!plantId) return;
  for (const row of stolen) {
    const email = (row.email || "").toLowerCase();
    const username = email.split("@")[0] || row.user_id.slice(0, 12);
    await sql.query(
      "update memberships set org_id = $1, role = $2, username = $3, email = $4, locked = $5 where user_id = $6",
      [plantId, "owner", username, email, false, row.user_id],
    ).catch(async () => {
      await sql.query(
        "update memberships set org_id = $1, role = $2, username = $3, email = $4 where user_id = $5",
        [plantId, "owner", username, email, row.user_id],
      );
    });
  }
}

async function ensureMembership(sql: Sql, userId: string) {
  const existing = await sql.query<{ role: string; org_id: string }>(
    "select role, org_id from memberships where user_id = $1 limit 1",
    [userId],
  );
  if (existing[0] && existing[0].role !== "platform") return;

  let org = await sql.query<{ id: string }>("select id from organizations where kind = $1 limit 1", ["platform"]);
  let orgId = org[0]?.id;
  if (!orgId) {
    orgId = ORG_ID;
    await sql.query(
      "insert into organizations (id, name, name_ar, plan, created_by, kind) values ($1,$2,$3,$4,$5,$6)",
      [orgId, "AEGIS", "أيجيس", "enterprise", userId, "platform"],
    ).catch(() => undefined);
    org = await sql.query<{ id: string }>("select id from organizations where kind = $1 limit 1", ["platform"]);
    orgId = org[0]?.id ?? ORG_ID;
    await sql.query(
      "insert into org_settings (org_id, manager_name, manager_email, hourly_enabled, last_brief_at) values ($1,$2,$3,$4,$5)",
      [orgId, OWNER_NAME, OWNER_EMAIL, false, new Date().toISOString()],
    ).catch(() => undefined);
  }

  await sql.query(
    "delete from memberships where role = $1 and user_id <> $2 and (lower(username) = $3 or lower(email) = $4)",
    ["platform", userId, OWNER_USERNAME, OWNER_EMAIL],
  ).catch(() => undefined);

  if (existing[0]) {
    await sql.query(
      "update memberships set username = $1, email = $2, role = $3, display_name = $4, locked = $5, org_id = $6 where user_id = $7",
      [OWNER_USERNAME, OWNER_EMAIL, "platform", OWNER_NAME, false, orgId, userId],
    ).catch(async () => {
      await sql.query(
        "update memberships set username = $1, email = $2, role = $3, display_name = $4, org_id = $5 where user_id = $6",
        [OWNER_USERNAME, OWNER_EMAIL, "platform", OWNER_NAME, orgId, userId],
      );
    });
    return;
  }
  await sql.query(
    "insert into memberships (org_id, user_id, email, display_name, role, username, locked) values ($1,$2,$3,$4,$5,$6,$7)",
    [orgId, userId, OWNER_EMAIL, OWNER_NAME, "platform", OWNER_USERNAME, false],
  ).catch(async () => {
    await sql.query(
      "insert into memberships (org_id, user_id, email, display_name, role, username) values ($1,$2,$3,$4,$5,$6)",
      [orgId, userId, OWNER_EMAIL, OWNER_NAME, "platform", OWNER_USERNAME],
    );
  });
}
