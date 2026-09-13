import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const KEYS = [
  "MSSQL_CONNECTION_STRING",
  "MSSQL_SERVER",
  "MSSQL_INSTANCE",
  "MSSQL_USER",
  "MSSQL_PASSWORD",
  "MSSQL_DATABASE",
  "MSSQL_ENCRYPT",
  "MSSQL_TRUST_CERT",
  "MSSQL_WINDOWS",
  "MSSQL_ODBC_DRIVER",
] as const;

const FACTORY = {
  MSSQL_SERVER: "DESKTOP-A0QINRF",
  MSSQL_INSTANCE: "MSSQLSERVERTEST",
  MSSQL_USER: "FGS",
  MSSQL_PASSWORD: "123456",
  MSSQL_DATABASE: "aegis_platform",
  MSSQL_ENCRYPT: "false",
  MSSQL_TRUST_CERT: "true",
} as const;

function applyFactoryDefaults() {
  for (const [key, value] of Object.entries(FACTORY)) {
    if (!process.env[key]?.trim()) process.env[key] = value;
  }
  delete process.env.MSSQL_WINDOWS;
}

export function loadAegisLocalConfig(): Record<string, string> {
  if (process.platform !== "win32") {
    return {
      MSSQL_SERVER: "",
      MSSQL_INSTANCE: "",
      MSSQL_USER: "",
      MSSQL_DATABASE: "",
    };
  }
  const candidates = [
    join(process.cwd(), "aegis.local.json"),
    join(process.cwd(), "..", "aegis.local.json"),
  ];
  for (const path of candidates) {
    if (!existsSync(path)) continue;
    try {
      const raw = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
      for (const key of KEYS) {
        const value = raw[key];
        if (typeof value === "string" && value.trim()) process.env[key] = value.trim();
      }
      break;
    } catch (err) {
      console.error("[aegis] failed to read", path, err);
    }
  }
  if (process.platform === "win32") applyFactoryDefaults();
  const server = process.env.MSSQL_SERVER || "";
  if (server.includes("\\")) {
    const [host, instance] = server.split("\\");
    process.env.MSSQL_SERVER = host;
    if (instance) process.env.MSSQL_INSTANCE = instance;
  }
  return {
    MSSQL_SERVER: process.env.MSSQL_SERVER || "",
    MSSQL_INSTANCE: process.env.MSSQL_INSTANCE || "",
    MSSQL_USER: process.env.MSSQL_USER || "",
    MSSQL_DATABASE: process.env.MSSQL_DATABASE || "",
  };
}

export function mssqlWanted(): boolean {
  loadAegisLocalConfig();
  if (process.platform === "win32") return true;
  return Boolean(
    process.env.MSSQL_CONNECTION_STRING?.trim() ||
      process.env.MSSQL_SERVER?.trim() ||
      process.env.MSSQL_USER?.trim(),
  );
}
