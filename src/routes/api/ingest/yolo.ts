import { createFileRoute } from "@tanstack/react-router";
import { ingestYoloFrame } from "@/lib/ppe/ingest";

export const Route = createFileRoute("/api/ingest/yolo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        let body: { cameraId?: string; result?: unknown } = {};
        try {
          body = (await request.json()) as { cameraId?: string; result?: unknown };
        } catch {
          return new Response("bad json", { status: 400 });
        }
        const res = await ingestYoloFrame({
          token,
          cameraId: String(body.cameraId ?? ""),
          result: body.result,
        });
        return Response.json(res, { status: res.ok ? 200 : 401 });
      },
    },
  },
});
