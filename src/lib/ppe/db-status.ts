import { createServerFn } from "@tanstack/react-start";
import { mssqlWanted } from "./local-config";

export const pingDatabase = createServerFn({ method: "GET" }).handler(async () => {
  const wanted = mssqlWanted();
  if (!wanted) {
    return {
      backend: "pglite" as const,
      ok: true,
      database: "memory",
      detail: "Not connected to SQL Server. Put FGS in aegis.local.json",
    };
  }
  try {
    const { getPlatformSql } = await import("./mssql");
    const sql = await getPlatformSql();
    const rows = await sql.query<{ name: string }>("select db_name() as name");
    return {
      backend: "mssql" as const,
      ok: true,
      database: rows[0]?.name || process.env.MSSQL_DATABASE || "aegis_platform",
      detail: `${process.env.MSSQL_USER || "FGS"} @ ${process.env.MSSQL_SERVER}\\${process.env.MSSQL_INSTANCE || ""}`,
    };
  } catch (err) {
    return {
      backend: "mssql" as const,
      ok: false,
      database: process.env.MSSQL_DATABASE || "aegis_platform",
      detail: err instanceof Error ? err.message : String(err),
    };
  }
});

export const currentActor = createServerFn({ method: "GET" }).handler(async () => {
  const { userFromMssql } = await import("./mssql-session");
  return userFromMssql();
});
