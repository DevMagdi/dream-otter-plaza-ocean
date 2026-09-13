export function ComplianceRing({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  const r = 42;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const tone = pct >= 85 ? "var(--color-safe)" : pct >= 60 ? "var(--color-warn)" : "var(--color-danger)";

  return (
    <div className="relative mx-auto size-36">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--color-elevated)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-medium tabular">{pct}%</span>
        <span className="text-xs text-muted">{label}</span>
      </div>
    </div>
  );
}
