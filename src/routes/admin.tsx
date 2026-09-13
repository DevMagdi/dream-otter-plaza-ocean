import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/lib/ppe/i18n";
import { cameraRuleOf, usePpeStore } from "@/lib/ppe/store";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const locale = usePpeStore((s) => s.locale);
  const org = usePpeStore((s) => s.org);
  const role = usePpeStore((s) => s.role);
  const members = usePpeStore((s) => s.members);
  const cameraRules = usePpeStore((s) => s.cameraRules);
  const cameras = usePpeStore((s) => s.cameras);
  const incidents = usePpeStore((s) => s.incidents);
  const patchOrg = usePpeStore((s) => s.patchOrg);
  const [name, setName] = useState(org?.name ?? "");
  const [nameAr, setNameAr] = useState(org?.nameAr ?? "");

  if (role === "member") return <Navigate to="/" />;
  if (role === "platform") return <Navigate to="/platform" />;

  const open = incidents.filter((i) => i.status === "open").length;
  const live = cameras.filter((c) => cameraRuleOf(cameraRules, c.id).enabled).length;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-2xs uppercase tracking-widest text-subtle">
              {t(locale, "login.product")}
            </p>
            <h1 className="mt-2 text-3xl font-medium tracking-tight">
              {t(locale, "admin.title")}
            </h1>
          </div>
          <Badge tone="mute">
            {t(locale, `admin.plan.${org?.plan ?? "trial"}`)}
            {" · "}
            {members.length}/{org?.seats ?? 3} {t(locale, "admin.seats")}
          </Badge>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-xs text-muted">{t(locale, "admin.users")}</p>
            <p className="mt-3 font-mono text-3xl tabular">
              {members.length}
              <span className="text-lg text-muted">/{org?.seats ?? 3}</span>
            </p>
          </Card>
          <Card>
            <p className="text-xs text-muted">{t(locale, "kpi.cameras")}</p>
            <p className="mt-3 font-mono text-3xl tabular">{live}</p>
          </Card>
          <Card>
            <p className="text-xs text-muted">{t(locale, "kpi.open")}</p>
            <p className="mt-3 font-mono text-3xl text-danger tabular">{open}</p>
          </Card>
        </section>

        <Card className="space-y-4">
          <h2 className="text-base font-medium">{t(locale, "admin.org")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="org-en">{t(locale, "admin.orgName")}</Label>
              <Input id="org-en" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="org-ar">{t(locale, "admin.orgNameAr")}</Label>
              <Input id="org-ar" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
            </div>
          </div>
          <Button
            onClick={() => {
              patchOrg({ name: name.trim() || org?.name, nameAr: nameAr.trim() || org?.nameAr });
              toast.success(t(locale, "toast.saved"));
            }}
          >
            {t(locale, "sites.save")}
          </Button>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-base font-medium">{t(locale, "admin.users")}</h2>
          <p className="text-sm text-muted">{t(locale, "admin.usersReadOnly")}</p>
          <ul className="divide-y divide-border">
            {members.map((m) => (
              <li key={m.userId} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm">{m.username || m.email}</p>
                  <p className="truncate text-xs text-muted">{m.displayName}</p>
                </div>
                <Badge tone={m.role === "owner" ? "safe" : "mute"}>{t(locale, `admin.role.${m.role}`)}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}