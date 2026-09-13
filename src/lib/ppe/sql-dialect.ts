/** Translate the app's Postgres-shaped SQL into T-SQL for Microsoft SQL Server. */

export function tenantDbName(orgId: string): string {
  const raw = `aegis_${orgId}`.replace(/[^A-Za-z0-9_]/g, "_");
  return raw.slice(0, 64);
}

export function pgToMssql(text: string): string {
  let sql = text.trim();
  sql = sql.replace(/count\(\*\)::int/gi, "cast(count(*) as int)");
  sql = sql.replace(/::int\b/gi, "");
  sql = sql.replace(/"([A-Za-z_][A-Za-z0-9_]*)"/g, "[$1]");
  sql = sql.replace(/(?<!\[)\b(plan|identity)\b(?!\])/gi, "[$1]");
  const limit = sql.match(/\s+limit\s+(\d+)\s*$/i);
  if (limit) {
    const n = limit[1];
    sql = sql.replace(/\s+limit\s+\d+\s*$/i, "");
    if (!/\bselect\s+top\s+/i.test(sql)) {
      sql = sql.replace(/^select\s+/i, `select top ${n} `);
    }
  }
  sql = sql.replace(/\$(\d+)/g, (_m, n) => `@p${n}`);
  sql = sql.replace(/\bnow\(\)/gi, "sysutcdatetime()");
  sql = sql.replace(/\btrue\b/gi, "1");
  sql = sql.replace(/\bfalse\b/gi, "0");
  return sql;
}
