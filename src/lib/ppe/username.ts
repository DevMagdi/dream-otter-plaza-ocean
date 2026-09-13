const DOMAIN = "aegis.local";

export function usernameToEmail(username: string): string {
  const u = username.trim().toLowerCase();
  if (!u) return "";
  if (u.includes("@")) return u;
  return `${u}@${DOMAIN}`;
}

export function emailToUsername(email: string): string {
  const e = email.trim().toLowerCase();
  if (e.endsWith(`@${DOMAIN}`)) return e.slice(0, -(DOMAIN.length + 1));
  return e;
}

export const USERNAME_RE = /^[a-zA-Z0-9._-]{3,32}$/;
