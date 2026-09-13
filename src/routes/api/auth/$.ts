import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";

function authAction(pathname: string): string {
  const marker = "/api/auth/";
  const i = pathname.indexOf(marker);
  const rest = i >= 0 ? pathname.slice(i + marker.length) : pathname.replace(/^\/+/, "");
  return rest.replace(/\/+$/, "").toLowerCase();
}

function allowAuth(request: Request): boolean {
  const action = authAction(new URL(request.url).pathname);
  if (action.startsWith("sign-up")) return false;
  if (action.startsWith("forget-password")) return false;
  if (action.startsWith("reset-password")) return false;
  if (action.startsWith("callback")) return false;
  if (action.includes("oauth")) return false;
  if (action.startsWith("sign-in/") && action !== "sign-in/email") return false;
  return true;
}

function blocked() {
  return Response.json({ error: "forbidden" }, { status: 403 });
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => (allowAuth(request) ? auth.handler(request) : blocked()),
      POST: ({ request }) => (allowAuth(request) ? auth.handler(request) : blocked()),
    },
  },
});
