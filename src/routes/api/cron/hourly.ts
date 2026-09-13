import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";
import { dispatchAllHourly } from "@/lib/ppe/saas";

export const Route = createFileRoute("/api/cron/hourly")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = env("CRON_SECRET");
        if (!secret) return new Response("not configured", { status: 503 });
        const auth = request.headers.get("authorization") ?? "";
        if (auth !== `Bearer ${secret}`) return new Response("forbidden", { status: 401 });
        const res = await dispatchAllHourly();
        return Response.json(res);
      },
      POST: async ({ request }) => {
        const secret = env("CRON_SECRET");
        if (!secret) return new Response("not configured", { status: 503 });
        const auth = request.headers.get("authorization") ?? "";
        if (auth !== `Bearer ${secret}`) return new Response("forbidden", { status: 401 });
        const res = await dispatchAllHourly();
        return Response.json(res);
      },
    },
  },
});
