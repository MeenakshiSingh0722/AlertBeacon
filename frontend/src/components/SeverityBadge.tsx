import { severityMeta, type Severity } from "@/data/alerts";

export function SeverityBadge({ severity, className = "" }: { severity: Severity; className?: string }) {
  const m = severityMeta[severity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${className}`}
      style={{
        background: m.soft,
        color: m.color,
        borderColor: `${m.color}33`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
      {m.label}
    </span>
  );
}
