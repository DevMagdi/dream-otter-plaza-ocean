import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Sql } from "@/lib/db";
import { loadAegisLocalConfig, mssqlWanted } from "./local-config";
import { pgToMssql, tenantDbName } from "./sql-dialect";

loadAegisLocalConfig();

export function mssqlConfigured(): boolean {
  loadAegisLocalConfig();
  return mssqlWanted();
}

type Pool = import("mssql").ConnectionPool;

const globalRef = globalThis as typeof globalThis & {
  __aegisMssqlPools__?: Map<string, Promise<Pool>>;
  __aegisMssqlSql__?: Map<string, Promise<Sql>>;
};

function pools(): Map<string, Promise<Pool>> {
  globalRef.__aegisMssqlPools__ ??= new Map();
  return globalRef.__aegisMssqlPools__;
}

function sqlCache(): Map<string, Promise<Sql>> {
  globalRef.__aegisMssqlSql__ ??= new Map();
  return globalRef.__aegisMssqlSql__;
}

function withDatabase(connectionString: string, database: string): string {
  const swapped = connectionString.replace(/Database\s*=\s*[^;]+/i, `Database=${database}`);
  return swapped.includes("Database=") ? swapped : `${connectionString};Database=${database}`;
}

function baseConfig(database: string): string | Record<string, unknown> {
  const connectionString = process.env.MSSQL_CONNECTION_STRING?.trim();
  if (connectionString && !process.env.MSSQL_USER?.trim()) {
    return withDatabase(connectionString, database);
  }
  let server = process.env.MSSQL_SERVER || "localhost";
  let instance = process.env.MSSQL_INSTANCE || "";
  if (server.includes("\\")) {
    const [host, inst] = server.split("\\");
    server = host;
    instance = inst || instance;
  }
  return {
    server,
    user: process.env.MSSQL_USER || "FGS",
    password: process.env.MSSQL_PASSWORD || "123456",
    database,
    options: {
      encrypt: process.env.MSSQL_ENCRYPT === "true",
      trustServerCertificate: process.env.MSSQL_TRUST_CERT !== "false",
      instanceName: instance || undefined,
      enableArithAbort: true,
    },
  };
}

async function openPool(database: string): Promise<Pool> {
  const map = pools();
  const hit = map.get(database);
  if (hit) return hit;
  const pending = (async () => {
    const req = createRequire(join(process.cwd(), "package.json"));
    const loaded = req("mssql") as {
      ConnectionPool?: new (c: never) => Pool;
      default?: { ConnectionPool: new (c: never) => Pool };
    };
    const Ctor = loaded.ConnectionPool ?? loaded.default?.ConnectionPool;
    if (typeof Ctor !== "function") {
      throw new Error("mssql.ConnectionPool missing");
    }
    const cfg = baseConfig(database);
    const pool = new Ctor(cfg as never);
    await pool.connect();
    const conf =
      typeof cfg === "string"
        ? cfg
        : `${String(cfg.server)}\\${String((cfg.options as { instanceName?: string })?.instanceName || "")}`;
    console.info(`[aegis] SQL Server connected: ${database} as ${process.env.MSSQL_USER || "FGS"} @ ${conf}`);
    return pool;
  })().catch((err) => {
    map.delete(database);
    throw err;
  });
  map.set(database, pending);
  return pending;
}

function wrapPool(pool: Pool): Sql {
  const run = async <T>(text: string, params: unknown[]): Promise<T[]> => {
    const translated = pgToMssql(text);
    const req = pool.request();
    params.forEach((value, i) => {
      req.input(`p${i + 1}`, value as never);
    });
    const result = await req.query(translated);
    return (result.recordset ?? []) as T[];
  };
  const sql = (async (strings: TemplateStringsArray, ...values: unknown[]) => {
    let text = strings[0] ?? "";
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1] ?? ""}`;
    return run(text, values);
  }) as unknown as Sql;
  sql.query = (text: string, params: unknown[] = []) => run(text, params);
  return sql;
}

async function applyMssqlFile(pool: Pool, name: string, sqlText: string) {
  const check = await pool.request().input("p1", name).query<{ name: string }>(
    "IF OBJECT_ID(N'_migrations', N'U') IS NULL SELECT CAST(NULL AS nvarchar(200)) as name ELSE SELECT name FROM _migrations WHERE name = @p1",
  );
  const already = (check.recordset || []).some((row: { name?: string }) => row.name === name);
  if (already) return;
  await pool.request().batch(sqlText);
  await pool
    .request()
    .input("p1", name)
    .query("IF NOT EXISTS (SELECT 1 FROM _migrations WHERE name = @p1) INSERT INTO _migrations (name) VALUES (@p1)");
}

function loadMssqlSql(kind: "platform" | "tenant"): { name: string; text: string } {
  const glob = import.meta.glob("/migrations/mssql/*.sql", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>;
  const match = Object.entries(glob).find(([path]) => path.includes(`001_${kind}.sql`));
  if (match) return { name: `001_${kind}.sql`, text: match[1] };
  const file = join(process.cwd(), "migrations", "mssql", `001_${kind}.sql`);
  return { name: `001_${kind}.sql`, text: readFileSync(file, "utf8") };
}

export async function getPlatformSql(): Promise<Sql> {
  const cache = sqlCache();
  const key = "__platform__";
  const hit = cache.get(key);
  if (hit) return hit;
  const pending = (async () => {
    const database = process.env.MSSQL_DATABASE?.trim() || "aegis_platform";
    try {
      const pool = await openPool(database);
      const file = loadMssqlSql("platform");
      await applyMssqlFile(pool, file.name, file.text);
      return wrapPool(pool);
    } catch (err) {
      const master = await openPool("master");
      await master.request().batch(
        `IF DB_ID(N'${database.replace(/'/g, "")}') IS NULL CREATE DATABASE [${database.replace(/[^\w]/g, "")}]`,
      );
      const pool = await openPool(database);
      const file = loadMssqlSql("platform");
      await applyMssqlFile(pool, file.name, file.text);
      return wrapPool(pool);
    }
  })();
  cache.set(key, pending);
  return pending;
}

export async function provisionTenantDb(orgId: string): Promise<string> {
  const dbName = tenantDbName(orgId);
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(dbName)) throw new Error("bad tenant db");
  const master = await openPool("master");
  await master.request().batch(`IF DB_ID(N'${dbName}') IS NULL CREATE DATABASE [${dbName}]`);
  const pool = await openPool(dbName);
  const file = loadMssqlSql("tenant");
  await applyMssqlFile(pool, file.name, file.text);
  return dbName;
}

export async function getTenantSql(orgId: string): Promise<Sql> {
  if (!mssqlConfigured()) {
    const { getSql } = await import("@/lib/db");
    return getSql();
  }
  const cache = sqlCache();
  const hit = cache.get(orgId);
  if (hit) return hit;
  const pending = (async () => {
    const platform = await getPlatformSql();
    const rows = await platform.query<{ db_name: string }>(
      "select db_name from tenants where org_id = $1",
      [orgId],
    );
    const dbName = rows[0]?.db_name || (await provisionTenantDb(orgId));
    if (!rows[0]) {
      await platform.query("insert into tenants (org_id, db_name) values ($1,$2)", [orgId, dbName]).catch(() => undefined);
    }
    const pool = await openPool(dbName);
    const file = loadMssqlSql("tenant");
    await applyMssqlFile(pool, file.name, file.text);
    return wrapPool(pool);
  })();
  cache.set(orgId, pending);
  return pending;
}

export { tenantDbName };
