import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AegisMark } from "@/components/aegis-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { pingDatabase } from "@/lib/ppe/db-status";
import { t } from "@/lib/ppe/i18n";
import { loginWithPassword } from "@/lib/ppe/saas";
import { clearAppSession, clearSignedOutIntent, isSignedOutIntent, setAppSession } from "@/lib/ppe/session";
import { usePpeStore } from "@/lib/ppe/store";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const locale = usePpeStore((s) => s.locale);
  const { user, isPending } = useCurrentUserState();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbLine, setDbLine] = useState("...");

  useEffect(() => {
    void pingDatabase()
      .then((s) => {
        if (!s.ok) setDbLine(`SQL Server فشل: ${s.detail}`);
        else if (s.backend === "mssql") setDbLine(`SQL Server · ${s.database} · ${s.detail}`);
        else setDbLine("غير متصل بـ SQL Server — عدّل aegis.local.json");
      })
      .catch(() => setDbLine("تعذر فحص قاعدة البيانات"));
  }, []);

  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg text-fg">
        <div className="flex items-center gap-3">
          <AegisMark className="size-10" />
          <p className="text-sm text-muted">{t(locale, "appName")}</p>
        </div>
      </main>
    );
  }
  if (user && !isSignedOutIntent()) return <Navigate to="/" />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await authClient.signOut().catch(() => undefined);
      clearAppSession();
      const res = await loginWithPassword({
        data: { username, password },
      });
      if (!res.ok || !("token" in res) || !res.token) {
        throw new Error("login");
      }
      setAppSession(res.token);
      clearSignedOutIntent();
      await authClient.getSession().catch(() => undefined);
      window.location.assign("dest" in res && res.dest ? res.dest : "/");
    } catch {
      setError(t(locale, "login.failed"));
      setBusy(false);
    }
  }

  return (
    <main className="canvas-dots grid min-h-dvh place-items-center px-4 text-fg">
      <div className="w-full max-w-md space-y-6 rounded-3xl bg-surface p-6 shadow-[var(--shadow-panel)] sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary">
            <AegisMark className="size-7" />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-widest">{t(locale, "appName")}</p>
            <p className="text-2xs uppercase tracking-widest text-subtle">
              {t(locale, "login.product")}
            </p>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-medium tracking-tight">{t(locale, "login.title")}</h1>
          <p className="mt-1 text-sm text-muted">{t(locale, "login.hint")}</p>
          <p className="mt-2 text-2xs text-subtle">{dbLine}</p>
        </div>
        {authEnabled ? (
          <form className="space-y-3" onSubmit={(e) => void onSubmit(e)}>
            <div className="space-y-1.5">
              <Label htmlFor="user">{t(locale, "login.user")}</Label>
              <Input
                id="user"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t(locale, "login.password")}</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={busy}>
              {t(locale, "login.submit")}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted">{t(locale, "login.disabled")}</p>
        )}
      </div>
    </main>
  );
}
