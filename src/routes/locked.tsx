import { createFileRoute } from "@tanstack/react-router";
import { AegisMark } from "@/components/aegis-mark";
import { AccountBar } from "@/components/account-bar";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { t } from "@/lib/ppe/i18n";
import { usePpeStore } from "@/lib/ppe/store";

export const Route = createFileRoute("/locked")({
  validateSearch: (s: Record<string, unknown>) => ({
    why: s.why === "off" ? "off" : undefined,
  }),
  component: LockedPage,
});

function LockedPage() {
  const locale = usePpeStore((s) => s.locale);
  const { why } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <div className="min-h-dvh bg-bg" />;
  if (!user) return <RedirectToSignIn />;
  const off = why === "off";
  return (
    <main className="canvas-dots grid min-h-dvh place-items-center px-4 text-fg">
      <div className="w-full max-w-md space-y-4 rounded-3xl bg-surface p-8 text-center shadow-[var(--shadow-panel)]">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary">
          <AegisMark className="size-7" />
        </span>
        <h1 className="text-xl font-medium">
          {t(locale, off ? "locked.offTitle" : "locked.title")}
        </h1>
        <p className="text-sm text-muted">
          {t(locale, off ? "locked.offHint" : "locked.hint")}
        </p>
        <div className="flex justify-center pt-2">
          <AccountBar />
        </div>
      </div>
    </main>
  );
}
