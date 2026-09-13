const FLAG = "aegis-signed-out";
const BEARER = "grok-auth.bearer-token";
const SID = "aegis_sid";

export function setAppSession(token: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(BEARER, token);
  } catch {
    /* ignore */
  }
  document.cookie = `${SID}=${encodeURIComponent(token)}; path=/; SameSite=Lax; Secure; max-age=604800`;
}

export function clearAppSession() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(BEARER);
  } catch {
    /* ignore */
  }
  document.cookie = `${SID}=; path=/; max-age=0`;
}

export function markSignedOut() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(FLAG, "1");
  } catch {
    /* ignore */
  }
  clearAppSession();
}

export function isSignedOutIntent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(FLAG) === "1";
  } catch {
    return false;
  }
}

export function clearSignedOutIntent() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(FLAG);
  } catch {
    /* ignore */
  }
}
