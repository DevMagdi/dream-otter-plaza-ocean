import { useEffect, useState, type ReactNode } from "react";
import { Link, Navigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Camera,
  ClipboardList,
  Factory,
  LayoutDashboard,
  Settings,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { AegisMark } from "@/components/aegis-mark";
import { AccountBar } from "@/components/account-bar";
import { HourlyScheduler } from "@/components/hourly-scheduler";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { t } from "@/lib/ppe/i18n";
import { loadWorkspace } from "@/lib/ppe/saas";
import { isSignedOutIntent } from "@/lib/ppe/session";
import { usePpeStore } from "@/lib/ppe/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", key: "nav.dashboard", icon: LayoutDashboard },
  { to: "/scan", key: "nav.scan", icon: Camera },
  { to: "/incidents", key: "nav.incidents", icon: ClipboardList },
  { to: "/sites", key: "nav.sites", icon: Factory },
  { to: "/reports", key: "nav.reports", icon: Activity },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const locale = usePpeStore((s) => s.locale);
  const setLocale = usePpeStore((s) => s.setLocale);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const openCount = usePpeStore(
    (s) => s.incidents.filter((i) => i.status === "open").length,
  );
  const readyBriefs = usePpeStore(
    (s) => s.briefs.filter((b) => b.status === "ready").length,
  );
  const role = usePpeStore((s) => s.role);
  const workspaceReady = usePpeStore((s) => s.workspaceReady);
  const hydrateWorkspace = usePpeStore((s) => s.hydrateWorkspace);
  const { user, isPending } = useCurrentUserState();
  const [gate, setGate] = useState<"no_org" | "disabled" | "error" | null>(null);
  const userId = user?.id;

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  useEffect(() => {
    if (!userId || !user) return;
    let cancelled = false;
    setGate(null);
    const timer = window.setTimeout(() => {
      if (!cancelled) setGate("error");
    }, 12000);
    void loadWorkspace({
      data: {
        displayName: user.displayName ?? undefined,
        email: user.primaryEmail ?? undefined,
        sessionToken:
          typeof window !== "undefined"
            ? window.sessionStorage.getItem("grok-auth.bearer-token") ?? undefined
            : undefined,
      },
    })
      .then((res) => {
        if (cancelled) return;
        window.clearTimeout(timer);
        if (res.ok) {
          hydrateWorkspace(res.workspace);
          return;
        }
        setGate(res.reason);
      })
      .catch(() => {
        if (!cancelled) {
          window.clearTimeout(timer);
          setGate("error");
        }
      });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [userId]);

  if (isPending) return <ShellChrome />;
  if (isSignedOutIntent()) return <Navigate to="/login" />;
  if (!user) return <RedirectToSignIn />;
  if (gate === "no_org") {
    return <Navigate to="/locked" search={{ why: undefined }} />;
  }
  if (gate === "disabled") {
    return <Navigate to="/locked" search={{ why: "off" }} />;
  }
  if (gate === "error") {
    return (
      <main className="canvas-dots grid min-h-dvh place-items-center px-4 text-fg">
        <div className="w-full max-w-md space-y-4 rounded-2xl bg-surface p-8 text-center shadow-[var(--shadow-panel)]">
          <AegisMark className="mx-auto size-10" />
          <p className="text-sm text-muted">{t(locale, "locked.retry")}</p>
          <Button onClick={() => window.location.assign("/")}>{t(locale, "login.submit")}</Button>
        </div>
      </main>
    );
  }
  if (!workspaceReady) return <ShellChrome />;

  const admin = role === "owner" || role === "admin";
  const isPlatform = role === "platform";
  const railItems: Array<{
    to: string;
    key: string;
    icon: LucideIcon;
    badge?: number;
  }> = isPlatform
    ? [{ to: "/platform", key: "nav.platform", icon: Shield }]
    : [
        ...NAV.map((item) => ({
          to: item.to,
          key: item.key,
          icon: item.icon,
          badge:
            item.to === "/incidents"
              ? openCount
              : item.to === "/reports"
                ? readyBriefs
                : 0,
        })),
        ...(admin ? [{ to: "/admin", key: "nav.admin", icon: Shield }] : []),
      ];

  if (isPlatform && pathname !== "/platform") return <Navigate to="/platform" />;
  if (!isPlatform && pathname === "/platform") return <Navigate to="/" />;

  return (
    <div className="canvas-dots min-h-dvh text-fg">
      <HourlyScheduler />
      <aside className="fixed inset-y-3 start-3 z-30 hidden w-[76px] flex-col items-center rounded-3xl bg-surface py-4 shadow-[var(--shadow-panel)] lg:flex">
        <Link
          to={isPlatform ? "/platform" : "/"}
          className="grid size-12 place-items-center rounded-2xl bg-primary"
          aria-label={t(locale, "appName")}
        >
          <AegisMark className="size-7" />
        </Link>
        <nav className="mt-8 flex flex-1 flex-col items-center gap-2">
          {railItems.map((item) => (
            <RailLink
              key={item.to}
              to={item.to}
              label={t(locale, item.key)}
              icon={item.icon}
              active={pathname === item.to}
              badge={item.badge}
            />
          ))}
        </nav>
        <RailLink
          to="/settings"
          label={t(locale, "nav.settings")}
          icon={Settings}
          active={pathname === "/settings"}
        />
      </aside>

      <header className="sticky top-3 z-20 mx-3 flex h-14 items-center justify-between gap-3 rounded-2xl bg-surface px-4 shadow-[var(--shadow-border)] lg:ms-[104px] lg:me-3">
        <div className="flex items-center gap-2.5 lg:hidden">
          <span className="grid size-9 place-items-center rounded-xl bg-primary">
            <AegisMark className="size-5" />
          </span>
          <div>
            <div className="text-sm font-medium">{t(locale, "appName")}</div>
            <div className="text-2xs text-subtle">PPE</div>
          </div>
        </div>
        <p className="hidden max-w-md truncate text-sm text-muted lg:block">
          {t(locale, "tagline")}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            aria-label="language"
          >
            {t(locale, "lang")}
          </Button>
          <AccountBar />
        </div>
      </header>

      <main className="px-4 pb-24 pt-6 lg:ms-[104px] lg:px-8 lg:pb-12">
        {children}
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-30 rounded-2xl bg-surface/95 shadow-[var(--shadow-panel)] backdrop-blur-sm lg:hidden">
        <div
          className={cn(
            "grid",
            railItems.length >= 6 ? "grid-cols-6" : railItems.length === 5 ? "grid-cols-5" : "grid-cols-4",
          )}
        >
          {railItems.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex h-16 flex-col items-center justify-center gap-1 text-2xs",
                  active ? "text-primary" : "text-muted",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-xl",
                    active ? "bg-primary text-primary-fg" : "",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                </span>
                <span>{t(locale, item.key)}</span>
                {item.badge ? (
                  <span className="absolute end-3 top-2 size-1.5 rounded-full bg-danger" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function RailLink({
  to,
  label,
  icon: Icon,
  active,
  badge,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      to={to}
      title={label}
      aria-label={label}
      className={cn(
        "relative grid size-12 place-items-center rounded-2xl transition-colors duration-150",
        active ? "bg-primary text-primary-fg" : "text-muted hover:bg-elevated hover:text-fg",
      )}
    >
      <Icon className="size-5" strokeWidth={1.75} />
      {badge ? (
        <span className="absolute end-1 top-1 size-2 rounded-full bg-danger" />
      ) : null}
    </Link>
  );
}

function ShellChrome() {
  const locale = usePpeStore((s) => s.locale);
  return (
    <div className="canvas-dots grid min-h-dvh place-items-center px-4 text-fg">
      <div className="flex items-center gap-3 rounded-2xl bg-surface px-5 py-4 shadow-[var(--shadow-border)]">
        <span className="grid size-10 place-items-center rounded-2xl bg-primary">
          <AegisMark className="size-6" />
        </span>
        <p className="text-sm text-muted">{t(locale, "appName")}</p>
      </div>
    </div>
  );
}
