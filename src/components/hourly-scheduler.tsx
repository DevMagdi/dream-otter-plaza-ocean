import { useEffect } from "react";
import { toast } from "sonner";
import { t } from "@/lib/ppe/i18n";
import { sendHourlyNow } from "@/lib/ppe/saas";
import { usePpeStore } from "@/lib/ppe/store";

const HOUR = 60 * 60 * 1000;

export function HourlyScheduler() {
  const hourlyEnabled = usePpeStore((s) => s.settings.hourlyEnabled);
  const lastBriefAt = usePpeStore((s) => s.settings.lastBriefAt);
  const locale = usePpeStore((s) => s.locale);
  const role = usePpeStore((s) => s.role);

  useEffect(() => {
    if (!hourlyEnabled || role === "platform") return;
    const tick = () => {
      const state = usePpeStore.getState();
      if (!state.settings.hourlyEnabled) return;
      if (Date.now() - state.settings.lastBriefAt < HOUR) return;
      void sendHourlyNow()
        .then((res) => {
          if (res.ok) {
            state.setSettings({ lastBriefAt: Date.now() });
            toast.message(t(state.locale, "settings.sentSmtp"));
          }
        })
        .catch(() => undefined);
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [hourlyEnabled, lastBriefAt, locale, role]);

  return null;
}
