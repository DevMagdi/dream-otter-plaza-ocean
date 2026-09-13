import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/lib/ppe/i18n";
import { PLANS } from "@/lib/ppe/plans";
import { createPlant, listAuditEvents, loadWorkspace, provisionUser, setUserLocked, setUserPassword } from "@/lib/ppe/saas";
import { usePpeStore } from "@/lib/ppe/store";
import type { PlanId } from "@/lib/ppe/types";

export const Route = createFileRoute("/platform")({ component: PlatformPage });

function PlatformPage() {
  const locale = usePpeStore((s) => s.locale);
  const role = usePpeStore((s) => s.role);
  const plants = usePpeStore((s) => s.plants);
  const directory = usePpeStore((s) => s.directory);
  const hydrateWorkspace = usePpeStore((s) => s.hydrateWorkspace);
  const [plantName, setPlantName] = useState("");
  const [plantNameAr, setPlantNameAr] = useState("");
  const [plan, setPlan] = useState<PlanId>("plant");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [orgId, setOrgId] = useState(plants[0]?.id ?? "");
  const [userRole, setUserRole] = useState<"owner" | "admin" | "member">("owner");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [audit, setAudit] = useState<Array<{ id: string; at: number; action: string; target: string; detail: string }>>([]);

  useEffect(() => {
    void listAuditEvents().then(setAudit).catch(() => undefined);
  }, [directory.length]);

  if (role !== "platform") return <Navigate to="/" />;

  async function refresh() {
    let token: string | undefined;
    try {
      token = window.sessionStorage.getItem("grok-auth.bearer-token") ?? undefined;
    } catch {
      token = undefined;
    }
    const res = await loadWorkspace({ data: { sessionToken: token } });
    if (res.ok) hydrateWorkspace(res.workspace);
    const events = await listAuditEvents().catch(() => []);
    setAudit(events);
  }

  async function onPlant() {
    setBusy(true);
    try {
      const created = await createPlant({
        data: { name: plantName.trim(), nameAr: plantNameAr.trim() || plantName.trim(), plan },
      });
      setOrgId(created.id);
      setPlantName("");
      setPlantNameAr("");
      await refresh();
      toast.success(t(locale, "platform.plantOk"));
    } catch {
      toast.error(t(locale, "platform.plantFail"));
    } finally {
      setBusy(false);
    }
  }

  async function onUser() {
    setBusy(true);
    try {
      const target = orgId || plants[0]?.id;
      if (!target) throw new Error("plant");
      const res = await provisionUser({
        data: {
          username: username.trim(),
          password,
          displayName: displayName.trim(),
          orgId: target,
          role: userRole,
        },
      });
      toast.success(`${t(locale, "login.user")}: ${res.username}`);
      setUsername("");
      setPassword("");
      setDisplayName("");
      await refresh();
    } catch {
      toast.error(t(locale, "platform.userFail"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="text-2xs uppercase tracking-widest text-subtle">{t(locale, "login.product")}</p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight">{t(locale, "platform.title")}</h1>
          <p className="mt-2 text-sm text-muted">{t(locale, "platform.hint")}</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-xs text-muted">{t(locale, "platform.plants")}</p>
            <p className="mt-3 font-mono text-3xl tabular">{plants.length}</p>
          </Card>
          <Card>
            <p className="text-xs text-muted">{t(locale, "admin.users")}</p>
            <p className="mt-3 font-mono text-3xl tabular">{directory.length}</p>
          </Card>
          <Card>
            <p className="text-xs text-muted">{t(locale, "platform.seatsOpen")}</p>
            <p className="mt-3 font-mono text-3xl tabular">
              {plants.reduce((n, p) => n + Math.max(0, p.seats - p.usedSeats), 0)}
            </p>
          </Card>
        </section>

        <Card className="space-y-4">
          <h2 className="text-base font-medium">{t(locale, "platform.newPlant")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="pn">{t(locale, "admin.orgName")}</Label>
              <Input id="pn" value={plantName} onChange={(e) => setPlantName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pa">{t(locale, "admin.orgNameAr")}</Label>
              <Input id="pa" value={plantNameAr} onChange={(e) => setPlantNameAr(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlan(p.id)}
                className={
                  plan === p.id
                    ? "h-11 rounded-full bg-primary px-4 text-sm text-primary-fg"
                    : "h-11 rounded-full bg-elevated px-4 text-sm text-muted"
                }
              >
                {t(locale, `admin.plan.${p.id}`)} · {p.seats}
              </button>
            ))}
          </div>
          <Button disabled={busy || plantName.trim().length < 2} onClick={() => void onPlant()}>
            {t(locale, "platform.createPlant")}
          </Button>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-base font-medium">{t(locale, "platform.newUser")}</h2>
          <p className="text-sm text-muted">{t(locale, "platform.userHint")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="un">{t(locale, "login.user")}</Label>
              <Input id="un" value={username} onChange={(e) => setUsername(e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw">{t(locale, "login.password")}</Label>
              <Input
                id="pw"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dn">{t(locale, "login.name")}</Label>
              <Input id="dn" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pl">{t(locale, "platform.plants")}</Label>
              <select
                id="pl"
                className="h-11 w-full rounded-xl bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)]"
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
              >
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {locale === "ar" ? p.nameAr || p.name : p.name} ({p.usedSeats}/{p.seats})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["owner", "admin", "member"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setUserRole(r)}
                className={
                  userRole === r
                    ? "h-11 rounded-full bg-primary px-4 text-sm text-primary-fg"
                    : "h-11 rounded-full bg-elevated px-4 text-sm text-muted"
                }
              >
                {t(locale, `admin.role.${r}`)}
              </button>
            ))}
          </div>
          <Button
            disabled={busy || !plants.length || username.trim().length < 3 || password.length < 10}
            onClick={() => void onUser()}
          >
            {t(locale, "platform.createUser")}
          </Button>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-base font-medium">{t(locale, "platform.plants")}</h2>
          <ul className="divide-y divide-border">
            {plants.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{locale === "ar" ? p.nameAr || p.name : p.name}</p>
                  <p className="text-xs text-muted">
                    {t(locale, `admin.plan.${p.plan}`)} · {p.usedSeats}/{p.seats}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-base font-medium">{t(locale, "admin.users")}</h2>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(locale, "platform.findUser")}
          />
          <ul className="divide-y divide-border">
            {directory
              .filter((u) => {
                const q = query.trim().toLowerCase();
                if (!q) return true;
                return (
                  u.username.toLowerCase().includes(q) ||
                  u.displayName.toLowerCase().includes(q) ||
                  u.orgName.toLowerCase().includes(q)
                );
              })
              .map((u) => (
              <li key={u.userId} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm">{u.username}</p>
                  <p className="text-xs text-muted">
                    {u.displayName} · {u.orgName}
                  </p>
                </div>
                {u.locked ? <Badge tone="danger">{t(locale, "platform.locked")}</Badge> : null}
                <Badge tone="mute">{t(locale, `admin.role.${u.role}`)}</Badge>
                <Button
                  size="sm"
                  variant={u.locked ? "secondary" : "danger"}
                  disabled={busy}
                  onClick={() => {
                    setBusy(true);
                    void setUserLocked({ data: { userId: u.userId, locked: !u.locked } })
                      .then(() => refresh())
                      .then(() =>
                        toast.success(t(locale, u.locked ? "platform.unlock" : "platform.lock")),
                      )
                      .catch(() => toast.error(t(locale, "login.failed")))
                      .finally(() => setBusy(false));
                  }}
                >
                  {u.locked ? t(locale, "platform.unlock") : t(locale, "platform.lock")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const next = window.prompt(t(locale, "platform.resetPass"), "");
                    if (!next || next.length < 10) return;
                    void setUserPassword({ data: { userId: u.userId, password: next } })
                      .then(() => toast.success(t(locale, "toast.saved")))
                      .catch(() => toast.error(t(locale, "login.failed")));
                  }}
                >
                  {t(locale, "platform.resetPass")}
                </Button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-base font-medium">{t(locale, "platform.audit")}</h2>
          <ul className="divide-y divide-border">
            {audit.map((e) => (
              <li key={e.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                <p className="font-mono text-xs">{e.action}</p>
                <p className="text-xs text-muted">
                  {e.target} {e.detail}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
