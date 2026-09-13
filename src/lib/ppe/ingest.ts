import { getSql } from "@/lib/db";
import { uid } from "@/lib/utils";
import { hashIngestKey, normalizeYoloResult } from "./yolo";
import type { PpeId } from "./types";

export async function ingestYoloFrame(input: {
  token: string;
  cameraId: string;
  result: unknown;
}): Promise<{ ok: true } | { ok: false }> {
  const token = input.token.trim();
  const cameraId = input.cameraId.replace(/[^a-z0-9-]/g, "").slice(0, 40);
  if (!token.startsWith("aegis_live_") || !cameraId) return { ok: false };
  const sql = await getSql();
  const hash = hashIngestKey(token);
  const org = await sql<{ org_id: string }>`select org_id from org_settings where ingest_key_hash = ${hash} limit 1`;
  if (!org[0]) return { ok: false };
  const orgId = org[0].org_id;
  const bucket = new Date().toISOString().slice(0, 16);
  await sql`insert into ingest_hits (org_id, bucket, n) values (${orgId}, ${bucket}, ${1}) on conflict (org_id, bucket) do update set n = ingest_hits.n + 1`;
  const hits = await sql<{ n: number }>`select n from ingest_hits where org_id = ${orgId} and bucket = ${bucket} limit 1`;
  if (Number(hits[0]?.n ?? 0) > 120) return { ok: false };
  const cam = await sql<{
    id: string;
    site_id: string;
    zone_id: string;
    enabled: boolean;
    checks_json: string;
  }>`select id, site_id, zone_id, enabled, checks_json from cameras where org_id = ${orgId} and id = ${cameraId} limit 1`;
  if (!cam[0] || !cam[0].enabled) return { ok: false };
  let checks: PpeId[] = [];
  try {
    checks = JSON.parse(cam[0].checks_json) as PpeId[];
  } catch {
    checks = ["helmet"];
  }
  const result = normalizeYoloResult(input.result, checks);
  if (!result) return { ok: false };
  const now = new Date().toISOString();
  const persons = result.persons.length;
  const violations = result.persons.filter((p) => !p.compliant).length;
  const scanId = uid("scan");
  await sql`insert into scans (org_id, id, at, site_id, zone_id, camera_id, source, persons, violations, risk, compliance) values (${orgId}, ${scanId}, ${now}, ${cam[0].site_id}, ${cam[0].zone_id}, ${cameraId}, ${"yolo"}, ${persons}, ${violations}, ${result.risk}, ${persons ? (persons - violations) / persons : 1})`;
  for (const p of result.persons.filter((x) => !x.compliant)) {
    await sql`insert into incidents (org_id, id, at, site_id, zone_id, camera_id, person_id, missing_json, present_json, risk, summary, summary_ar, status) values (${orgId}, ${uid("inc")}, ${now}, ${cam[0].site_id}, ${cam[0].zone_id}, ${cameraId}, ${p.id}, ${JSON.stringify(p.missing)}, ${JSON.stringify(p.present)}, ${result.risk}, ${result.summary}, ${result.summaryAr}, ${"open"})`;
  }
  await sql`update cameras set cached_json = ${JSON.stringify(result)} where org_id = ${orgId} and id = ${cameraId}`;
  return { ok: true };
}
