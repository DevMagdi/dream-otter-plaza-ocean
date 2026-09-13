export function AegisMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M16 3.2 6.4 7.2v7.6c0 6.2 4.1 11.9 9.6 13.6 5.5-1.7 9.6-7.4 9.6-13.6V7.2L16 3.2Z"
        className="fill-primary"
      />
      <path
        d="M10.2 14.2h11.6c.2 2.8-1.3 5.8-5.8 7.2-4.5-1.4-6-4.4-5.8-7.2Z"
        className="fill-primary-fg/90"
      />
      <path
        d="M12.4 14.2h7.2v-1.4c0-1.7-1.6-2.8-3.6-2.8s-3.6 1.1-3.6 2.8v1.4Z"
        className="fill-primary-fg"
      />
    </svg>
  );
}
