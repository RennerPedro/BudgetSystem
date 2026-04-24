interface AIBadgeProps {
  label?: string;
}

export function AIBadge({ label = 'Com IA' }: AIBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--accent-primary)]">
      {label}
    </span>
  );
}
