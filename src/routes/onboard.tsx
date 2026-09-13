import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/onboard")({
  component: () => <Navigate to="/locked" search={{ why: undefined }} />,
});
