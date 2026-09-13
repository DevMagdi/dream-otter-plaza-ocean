import { getSql } from "@/lib/db";

const WINDOW_MS = 15 * 60_000;
const MAX_FAILS = 8;

function keyOf(raw: string): string {
  return raw.trim().toLowerCase().slice(0, 120);
}

export async function loginBlocked(identity: string): Promise<boolean> {
  try {
    const k = keyOf(identity);
    const sql = await getSql();
    const rows = await sql<{ fails: number; blocked_until: string | null }>`select fails, blocked_until from login_attempts where identity = ${k} limit 1`;
    const row = rows[0];
    if (!row?.blocked_until) return false;
    if (Date.parse(row.blocked_until) > Date.now()) return true;
    await sql`delete from login_attempts where identity = ${k}`;
    return false;
  } catch {
    return false;
  }
}

export async function recordLoginFailure(identity: string) {
  try {
    const k = keyOf(identity);
    const sql = await getSql();
    const rows = await sql<{ fails: number }>`select fails from login_attempts where identity = ${k} limit 1`;
    const fails = Number(rows[0]?.fails ?? 0) + 1;
    const blocked = fails >= MAX_FAILS ? new Date(Date.now() + WINDOW_MS).toISOString() : null;
    await sql`insert into login_attempts (identity, fails, blocked_until) values (${k}, ${fails}, ${blocked}) on conflict (identity) do update set fails = excluded.fails, blocked_until = excluded.blocked_until`;
  } catch {
    /* table may still be migrating */
  }
}

export async function recordLoginSuccess(identity: string) {
  try {
    const k = keyOf(identity);
    const sql = await getSql();
    await sql`delete from login_attempts where identity = ${k}`;
  } catch {
    /* ignore */
  }
}
