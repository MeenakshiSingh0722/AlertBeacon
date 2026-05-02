import { useMemo, useState } from "react";
import { useAlerts } from "@/store/useAlerts";
import { severityMeta, timeAgo, type AlertStatus, type Severity } from "@/data/alerts";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Search, ChevronDown, CheckCircle2, MapPin, Users } from "lucide-react";

const STATUSES: (AlertStatus | "all")[] = ["all", "new", "active", "resolved"];
const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];

export default function Alerts() {
  const { alerts, resolve } = useAlerts();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [sevFilter, setSevFilter] = useState<Set<Severity>>(new Set(SEVERITIES));
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return alerts
      .filter((a) => (status === "all" ? true : a.status === status))
      .filter((a) => sevFilter.has(a.severity))
      .filter((a) =>
        q.trim()
          ? (a.title + a.location + a.category + a.source).toLowerCase().includes(q.toLowerCase())
          : true
      );
  }, [alerts, status, sevFilter, q]);

  return (
    <div className="p-6 space-y-5">
      {/* Filter bar */}
      <div className="soft-card p-4 sticky top-20 z-20">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search alerts, locations, sources..."
              className="w-full pl-9 pr-3 h-10 rounded-xl border border-input bg-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/30 text-sm"
            />
          </div>

          <div className="flex gap-1.5">
            {SEVERITIES.map((s) => {
              const on = sevFilter.has(s);
              const m = severityMeta[s];
              return (
                <button
                  key={s}
                  onClick={() => {
                    const next = new Set(sevFilter);
                    on ? next.delete(s) : next.add(s);
                    setSevFilter(next);
                  }}
                  className="px-3 h-9 rounded-full text-[11px] font-semibold uppercase tracking-wider border transition"
                  style={
                    on
                      ? { background: m.soft, color: m.color, borderColor: `${m.color}55` }
                      : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }
                  }
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-1 p-1 rounded-xl bg-muted">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 h-8 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                  status === s
                    ? "bg-card text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} of {alerts.length}
          </span>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((a) => {
          const m = severityMeta[a.severity];
          const isOpen = open === a.id;
          return (
            <div
              key={a.id}
              className="soft-card p-4 hover:border-primary/40 transition group animate-fade-up"
              style={{ borderLeft: `4px solid ${m.color}` }}
            >
              <button
                onClick={() => setOpen(isOpen ? null : a.id)}
                className="w-full text-left flex items-start gap-4"
              >
                <div className="h-11 w-11 rounded-xl grid place-items-center text-xl shrink-0" style={{ background: m.soft }}>
                  {a.categoryIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SeverityBadge severity={a.severity} />
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {a.category} · {a.source} · {a.id}
                    </span>
                    {a.status === "new" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold uppercase tracking-wider">
                        New
                      </span>
                    )}
                    {a.status === "resolved" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-severity-low-soft text-severity-low font-semibold uppercase tracking-wider">
                        Resolved
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-semibold text-[15px]">{a.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {a.location}</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {a.affected.toLocaleString()} affected</span>
                    <span>{timeAgo(a.timestamp)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {a.status !== "resolved" && (
                    <span
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        resolve(a.id);
                      }}
                      className="cursor-pointer h-9 px-3 rounded-lg border border-severity-low/40 text-severity-low bg-severity-low-soft text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 hover:-translate-y-0.5 transition"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                    </span>
                  )}
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-border grid md:grid-cols-3 gap-4 text-sm animate-fade-up">
                  <div className="md:col-span-2">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                      AI summary
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{a.summary}</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                        Severity score
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${a.score * 10}%`, background: m.color }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{a.score.toFixed(1)}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                        Source
                      </div>
                      <div className="text-sm">{a.source}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="soft-card p-10 text-center text-muted-foreground">
            No alerts match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
