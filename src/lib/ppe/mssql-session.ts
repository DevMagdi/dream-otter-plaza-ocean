import { getRequest } from "@tanstack/react-start/server";
import { mssqlWanted } from "./local-config";

export async function userFromMssql(
  bearerToken?: string,
): Promise<{ id: string; email: string | null } | null> {
  if (!mssqlWanted()) return null;
  try {
    const req = getRequest();
    const header = req?.headers.get("authorization") || "";
    const cookie = req?.headers.get("cookie") || "";
    const sid = cookie.match(/(?:^|;\s*)aegis_sid=([^;]+)/);
    const token =
      (bearerToken || "").trim() ||
      (header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "") ||
      (sid ? decodeURIComponent(sid[1]) : "");
    if (!token) return null;
    const { getPlatformSql } = await import("./mssql");
    const sql = await getPlatformSql();
    const ses = await sql.query<{ userId: string }>(
      'select "userId" from "session" where token = $1 and "expiresAt" > $2',
      [token, new Date().toISOString()],
    );
    if (!ses[0]?.userId) return null;
    const users = await sql.query<{ id: string; email: string }>(
      'select id, email from "user" where id = $1',
      [ses[0].userId],
    );
    const row = users[0];
    if (!row) return null;
    return { id: row.id, email: row.email ?? null };
  } catch (err) {
    console.error("[aegis] mssql session", err);
    return null;
  }
}
