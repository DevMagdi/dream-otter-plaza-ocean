export const OWNER_EMAIL = "mohamedmigo98@gmail.com";
export const OWNER_USERNAME = "mohamedmigo98";
export const OWNER_ID = "usr_platform_mohamed";

export function isProductOwner(userId: string, email?: string | null): boolean {
  const id = (userId || "").trim();
  const e = (email || "").trim().toLowerCase();
  const local = e.split("@")[0] || "";
  return id === OWNER_ID || e === OWNER_EMAIL || local === OWNER_USERNAME;
}

export function resolveWorkspaceIdentity(input: {
  requestUserId: string;
  requestEmail?: string | null;
  tokenUserId?: string;
  tokenEmail?: string | null;
}): { userId: string; promoteOwner: boolean } {
  const tokenId = input.tokenUserId?.trim();
  if (tokenId) {
    if (isProductOwner(tokenId, input.tokenEmail)) {
      return { userId: input.requestUserId || tokenId, promoteOwner: true };
    }
    return { userId: tokenId, promoteOwner: false };
  }
  if (isProductOwner(input.requestUserId, input.requestEmail)) {
    return { userId: input.requestUserId, promoteOwner: true };
  }
  return { userId: input.requestUserId, promoteOwner: false };
}

export function destForRole(role: string | null | undefined): "/platform" | "/" {
  return role === "platform" ? "/platform" : "/";
}
