import { getSql } from "@/lib/db";
import { uid } from "@/lib/utils";

export async function writeAudit(input: {
  actorId: string;
  action: string;
  target?: string;
  detail?: string;
}) {
  const sql = await getSql();
  await sql`insert into audit_events (id, at, actor_id, action, target, detail) values (${uid("aud")}, ${new Date().toISOString()}, ${input.actorId.slice(0, 80)}, ${input.action.slice(0, 80)}, ${(input.target ?? "").slice(0, 120)}, ${(input.detail ?? "").slice(0, 240)})`;
}

export async function listAudit(limit = 40) {
  const sql = await getSql();
  const n = Math.min(80, Math.max(1, limit));
  return sql<{
    id: string;
    at: string;
    actor_id: string;
    action: string;
    target: string;
    detail: string;
  }>`select id, at, actor_id, action, target, detail from audit_events order by at desc limit ${n}`;
}
