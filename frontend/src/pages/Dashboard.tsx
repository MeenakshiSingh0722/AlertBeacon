import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAlerts } from "@/store/useAlerts";
import { severityMeta, timeAgo, type Severity } from "@/data/alerts";
import { SeverityBadge } from "@/components/SeverityBadge";
import { AlertTriangle, Activity, Wifi, CheckCircle2, Plus } from "lucide-react";

function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const dur = 700;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{n.toLocaleString()}</span>;
}

const trendData = [
  { t: "00:00", critical: 1, high: 2, medium: 4, low: 3 },
  { t: "04:00", critical: 2, high: 3, medium: 3, low: 4 },
  { t: "08:00", critical: 3, high: 5, medium: 6, low: 5 },
  { t: "12:00", critical: 4, high: 6, medium: 5, low: 6 },
  { t: "16:00", critical: 5, high: 7, medium: 7, low: 8 },
  { t: "20:00", critical: 4, high: 6, medium: 8, low: 7 },
  { t: "Now",  critical: 3, high: 5, medium: 6, low: 6 },
];

export default function Dashboard() {
  const { alerts, prepend } = useAlerts();

  const stats = useMemo(() => {
    const critical = alerts.filter((a) => a.severity === "critical" && a.status !== "resolved").length;
    const active = alerts.filter((a) => a.status !== "resolved").length;
    const resolved = alerts.filter((a) => a.status === "resolved").length;
    return { critical, active, resolved };
  }, [alerts]);

  const categories = useMemo(() => {
    const map: Record<string, number> = {};
    alerts.forEach((a) => (map[a.category] = (map[a.category] || 0) + 1));
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [alerts]);

  const pieColors = [
    "hsl(var(--primary))",
    "hsl(var(--severity-critical))",
    "hsl(var(--severity-high))",
    "hsl(var(--severity-medium))",
    "hsl(var(--severity-low))",
    "hsl(var(--primary-glow))",
    "hsl(214 60% 70%)",
    "hsl(195 65% 55%)",
  ];

  const simulate = () => {
    const sevList: Severity[] = ["critical", "high", "medium", "low"];
    const sev = sevList[Math.floor(Math.random() * sevList.length)];
    prepend({
      id: `AB-${1100 + Math.floor(Math.random() * 999)}`,
      title: "Simulated incident — incoming feed",
      category: "Simulation",
      categoryIcon: "🧪",
      severity: sev,
      score: Math.round((Math.random() * 5 + 5) * 10) / 10,
      location: "Test Region, IN",
      lat: 22.5 + Math.random() * 4,
      lng: 78 + Math.random() * 4,
      affected: Math.floor(Math.random() * 50000),
      source: "Simulator",
      timestamp: Date.now(),
      status: "new",
      summary: "Simulated alert generated for demonstration.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Critical incidents"
          value={stats.critical}
          delta="+12% vs yesterday"
          tone="critical"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <StatCard
          label="Active incidents (24h)"
          value={stats.active}
          delta="Monitoring"
          tone="high"
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          label="Sources online"
          value={12}
          suffix=" / 14"
          delta="2 sources slow"
          tone="info"
          icon={<Wifi className="h-5 w-5" />}
        />
        <StatCard
          label="Resolved today"
          value={stats.resolved}
          delta="Great work"
          tone="low"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="soft-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-base">Severity trend</h3>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </div>
            <div className="flex gap-1 text-[11px]">
              {(["critical", "high", "medium", "low"] as Severity[]).map((s) => (
                <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted">
                  <span className="h-2 w-2 rounded-full" style={{ background: severityMeta[s].color }} />
                  {severityMeta[s].label}
                </span>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {(["critical", "high", "medium", "low"] as Severity[]).map((s) => (
                    <linearGradient key={s} id={`g-${s}`} x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={severityMeta[s].color} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={severityMeta[s].color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                {(["low", "medium", "high", "critical"] as Severity[]).map((s) => (
                  <Area
                    key={s}
                    type="monotone"
                    dataKey={s}
                    stroke={severityMeta[s].color}
                    fill={`url(#g-${s})`}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="soft-card p-5">
          <h3 className="font-display font-semibold text-base">Category breakdown</h3>
          <p className="text-xs text-muted-foreground mb-2">By incident type</p>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categories} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {categories.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} stroke="hsl(var(--card))" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live feed */}
      <div className="soft-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="live-dot" />
            <h3 className="font-display font-semibold text-base">Live feed</h3>
          </div>
          <span className="text-xs text-muted-foreground">{alerts.length} events</span>
        </div>
        <div className="space-y-2 max-h-[420px] overflow-auto scrollbar-thin pr-1">
          {alerts.slice(0, 12).map((a) => (
            <div
              key={a.id}
              className="animate-fade-up flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:bg-accent/40 hover:border-primary/30 transition-all"
              style={{ borderLeft: `4px solid ${severityMeta[a.severity].color}` }}
            >
              <div className="h-9 w-9 rounded-lg grid place-items-center text-lg" style={{ background: severityMeta[a.severity].soft }}>
                {a.categoryIcon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={a.severity} />
                  <span className="text-xs text-muted-foreground">{a.category} · {a.source}</span>
                </div>
                <div className="text-sm font-medium truncate">{a.title}</div>
                <div className="text-xs text-muted-foreground">📍 {a.location} · {timeAgo(a.timestamp)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Affected</div>
                <div className="text-sm font-semibold">{a.affected.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulate */}
      <button
        onClick={simulate}
        className="fixed bottom-6 right-6 z-30 h-14 px-5 rounded-full bg-gradient-primary text-primary-foreground font-semibold tracking-wider text-sm shadow-card hover:-translate-y-0.5 transition flex items-center gap-2"
      >
        <Plus className="h-4 w-4" /> Simulate crisis
      </button>
    </div>
  );

  function StatCard({
    label,
    value,
    suffix,
    delta,
    tone,
    icon,
  }: {
    label: string;
    value: number;
    suffix?: string;
    delta: string;
    tone: "critical" | "high" | "medium" | "low" | "info";
    icon: React.ReactNode;
  }) {
    const colorMap: Record<string, { c: string; b: string }> = {
      critical: { c: "hsl(var(--severity-critical))", b: "hsl(var(--severity-critical-soft))" },
      high: { c: "hsl(var(--severity-high))", b: "hsl(var(--severity-high-soft))" },
      medium: { c: "hsl(var(--severity-medium))", b: "hsl(var(--severity-medium-soft))" },
      low: { c: "hsl(var(--severity-low))", b: "hsl(var(--severity-low-soft))" },
      info: { c: "hsl(var(--severity-info))", b: "hsl(var(--severity-info-soft))" },
    };
    const t = colorMap[tone];
    return (
      <div className="soft-card p-5 relative overflow-hidden hover:-translate-y-0.5 transition-transform">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full" style={{ background: t.b }} />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
            <div className="mt-2 text-3xl font-display font-bold">
              <CountUp value={value} />
              {suffix && <span className="text-base text-muted-foreground font-medium">{suffix}</span>}
            </div>
            <div className="mt-1 text-xs" style={{ color: t.c }}>{delta}</div>
          </div>
          <div className="h-10 w-10 rounded-xl grid place-items-center" style={{ background: t.b, color: t.c }}>
            {icon}
          </div>
        </div>
      </div>
    );
  }
}
