import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useAlerts } from "@/store/useAlerts";
import { severityMeta, timeAgo, type Severity } from "@/data/alerts";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Filter, Layers } from "lucide-react";

function makeIcon(sev: Severity) {
  const m = severityMeta[sev];
  const pulse = sev === "critical" || sev === "high";
  const html = `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:34px;height:34px;">
      ${pulse ? `<span style="position:absolute;inset:0;border-radius:9999px;background:${m.color};opacity:.35;animation:pulse-ring 1.6s ease-out infinite;"></span>` : ""}
      <span style="position:relative;width:14px;height:14px;border-radius:9999px;background:${m.color};box-shadow:0 0 0 4px hsl(var(--background)),0 0 14px ${m.ring};"></span>
    </div>`;
  return L.divIcon({
    html,
    className: "ab-marker",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -14],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  if (points.length) {
    const b = L.latLngBounds(points);
    map.fitBounds(b, { padding: [40, 40], maxZoom: 6 });
  }
  return null;
}

const ALL_SEV: Severity[] = ["critical", "high", "medium", "low"];

export default function MapView() {
  const { alerts } = useAlerts();
  const [active, setActive] = useState<Set<Severity>>(new Set(ALL_SEV));
  const [range, setRange] = useState<"1H" | "6H" | "24H" | "7D">("24H");

  const filtered = useMemo(() => {
    const cutoff = { "1H": 1, "6H": 6, "24H": 24, "7D": 24 * 7 }[range] * 3600_000;
    return alerts.filter(
      (a) => active.has(a.severity) && Date.now() - a.timestamp <= cutoff && a.status !== "resolved"
    );
  }, [alerts, active, range]);

  const points: [number, number][] = filtered.map((a) => [a.lat, a.lng]);

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-0">
      {/* Filter panel */}
      <aside className="w-72 shrink-0 border-r border-border bg-sidebar/60 backdrop-blur p-4 overflow-auto scrollbar-thin">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-primary" />
          <h2 className="font-display font-semibold">Active filters</h2>
          <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-primary-soft text-primary font-semibold">
            {filtered.length}
          </span>
        </div>

        <Section title="Severity">
          <div className="space-y-2">
            {ALL_SEV.map((s) => {
              const m = severityMeta[s];
              const on = active.has(s);
              return (
                <button
                  key={s}
                  onClick={() => {
                    const next = new Set(active);
                    on ? next.delete(s) : next.add(s);
                    setActive(next);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition ${
                    on ? "bg-card border-border" : "bg-muted/40 border-transparent text-muted-foreground"
                  }`}
                  style={on ? { borderColor: `${m.color}55` } : undefined}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
                  <span className="font-medium">{m.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {alerts.filter((a) => a.severity === s).length}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Time range">
          <div className="grid grid-cols-4 gap-1.5">
            {(["1H", "6H", "24H", "7D"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`py-1.5 rounded-lg text-xs font-semibold tracking-wider border transition ${
                  range === r
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Map view">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card border border-border text-sm">
            <Layers className="h-4 w-4 text-primary" />
            Pins
            <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
              OSM tiles
            </span>
          </div>
        </Section>

        <div className="mt-6 p-4 rounded-2xl bg-gradient-soft border border-border">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Active incidents
          </div>
          <div className="mt-1 text-4xl font-display font-bold text-primary">{filtered.length}</div>
          <div className="text-xs text-muted-foreground">
            in selected severities · {range}
          </div>
        </div>
      </aside>

      {/* Map */}
      <div className="flex-1 relative min-w-0">
        <MapContainer
          center={[22.5, 80]}
          zoom={5}
          scrollWheelZoom
          className="h-full w-full"
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap"
          />
          <FitBounds points={points} />
          {filtered.map((a) => (
            <Marker key={a.id} position={[a.lat, a.lng]} icon={makeIcon(a.severity)}>
              <Popup>
                <div className="min-w-[240px]" style={{ borderLeft: `3px solid ${severityMeta[a.severity].color}`, paddingLeft: 10 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <SeverityBadge severity={a.severity} />
                    <span className="text-[11px] text-muted-foreground">{a.category}</span>
                  </div>
                  <div className="text-sm font-semibold">{a.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">📍 {a.location}</div>
                  <div className="mt-2 text-xs flex items-center justify-between">
                    <span>Severity score</span>
                    <span className="font-semibold">{a.score.toFixed(1)} / 10</span>
                  </div>
                  <div className="h-1.5 mt-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${a.score * 10}%`, background: severityMeta[a.severity].color }}
                    />
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    {a.affected.toLocaleString()} affected · {timeAgo(a.timestamp)}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Bottom ticker */}
        <div className="absolute bottom-0 inset-x-0 h-12 border-t border-border bg-background/90 backdrop-blur overflow-hidden flex items-center">
          <div className="px-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-r border-border h-full flex items-center bg-card">
            Live ticker
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-8 whitespace-nowrap animate-ticker py-1 px-4">
              {[...filtered, ...filtered].map((a, i) => (
                <span key={i} className="text-xs flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: severityMeta[a.severity].color }} />
                  <span className="font-medium">{a.title}</span>
                  <span className="text-muted-foreground">— {a.location} · {timeAgo(a.timestamp)}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">{title}</div>
      {children}
    </div>
  );
}
