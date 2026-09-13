import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { mailConfigured } from "@/lib/ppe/mail";
import { yoloConfigured } from "@/lib/ppe/yolo";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const sql = await getSql();
          await sql`select 1`;
          return Response.json({
            ok: true,
            db: true,
            mail: mailConfigured(),
            yolo: yoloConfigured(),
          });
        } catch {
          return Response.json({ ok: false, db: false }, { status: 503 });
        }
      },
    },
  },
});
