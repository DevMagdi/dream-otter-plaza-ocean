import { useState } from "react";
import { signOut } from "@/lib/auth/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { t } from "@/lib/ppe/i18n";
import { markSignedOut } from "@/lib/ppe/session";
import { usePpeStore } from "@/lib/ppe/store";

export function AccountBar() {
  const user = useCurrentUser();
  const locale = usePpeStore((s) => s.locale);
  const [busy, setBusy] = useState(false);
  if (!user) return null;
  const label = user.displayName ?? user.primaryEmail ?? t(locale, "login.user");

  async function onSignOut() {
    setBusy(true);
    markSignedOut();
    try {
      await signOut("/login");
    } catch {
      window.location.assign("/login");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-full bg-elevated text-xs font-medium">
        {label.charAt(0).toUpperCase()}
      </span>
      <span className="hidden max-w-[7rem] truncate text-sm sm:inline">{label}</span>
      <button
        type="button"
        disabled={busy}
        onClick={() => void onSignOut()}
        className="h-8 rounded-full px-3 text-xs text-muted hover:bg-elevated hover:text-fg disabled:opacity-50"
      >
        {busy ? "…" : t(locale, "login.signOut")}
      </button>
    </div>
  );
}
