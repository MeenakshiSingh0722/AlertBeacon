export type Severity = "critical" | "high" | "medium" | "low";
export type AlertStatus = "new" | "active" | "resolved";

export interface Alert {
  id: string;
  title: string;
  category: string;
  categoryIcon: string;
  severity: Severity;
  score: number; // 0-10
  location: string;
  lat: number;
  lng: number;
  affected: number;
  source: string;
  timestamp: number; // ms
  status: AlertStatus;
  summary: string;
}

const now = Date.now();
const m = (n: number) => now - n * 60_000;

export const seedAlerts: Alert[] = [
  {
    id: "AB-1042",
    title: "Flash flood warning issued for Mumbai suburbs",
    category: "Flood",
    categoryIcon: "🌊",
    severity: "critical",
    score: 9.2,
    location: "Mumbai, Maharashtra",
    lat: 19.076,
    lng: 72.8777,
    affected: 124000,
    source: "IMD",
    timestamp: m(2),
    status: "new",
    summary:
      "IMD has issued a red alert for Mumbai metropolitan region. Heavy to extremely heavy rainfall expected over next 6 hours. Low-lying areas at high risk.",
  },
  {
    id: "AB-1041",
    title: "Earthquake of 5.8 magnitude near Imphal",
    category: "Earthquake",
    categoryIcon: "🌍",
    severity: "high",
    score: 7.8,
    location: "Imphal, Manipur",
    lat: 24.817,
    lng: 93.9368,
    affected: 32000,
    source: "USGS",
    timestamp: m(14),
    status: "active",
    summary:
      "Moderate quake recorded at depth 12km. Reports of structural damage in two districts. Aftershocks possible.",
  },
  {
    id: "AB-1040",
    title: "Cyclone Remal landfall expected within 12 hours",
    category: "Cyclone",
    categoryIcon: "🌀",
    severity: "critical",
    score: 9.5,
    location: "Sundarbans, West Bengal",
    lat: 21.949,
    lng: 88.91,
    affected: 850000,
    source: "IMD",
    timestamp: m(34),
    status: "active",
    summary:
      "Severe cyclonic storm with sustained winds of 130 km/h. Mass evacuation underway across coastal districts.",
  },
  {
    id: "AB-1039",
    title: "Forest fire spreading in Uttarakhand hills",
    category: "Wildfire",
    categoryIcon: "🔥",
    severity: "high",
    score: 7.2,
    location: "Nainital, Uttarakhand",
    lat: 29.3919,
    lng: 79.4542,
    affected: 4800,
    source: "FSI",
    timestamp: m(58),
    status: "active",
    summary: "Wildfire across approximately 220 hectares. Wind shifting south-east; ground crews deployed.",
  },
  {
    id: "AB-1038",
    title: "Heatwave alert for Rajasthan districts",
    category: "Heatwave",
    categoryIcon: "🌡️",
    severity: "medium",
    score: 5.6,
    location: "Jaisalmer, Rajasthan",
    lat: 26.9157,
    lng: 70.9083,
    affected: 75000,
    source: "IMD",
    timestamp: m(120),
    status: "active",
    summary: "Day temperatures expected 46–48°C. Vulnerable populations advised to stay indoors.",
  },
  {
    id: "AB-1037",
    title: "Landslide blocks NH-44 in Himachal Pradesh",
    category: "Landslide",
    categoryIcon: "⛰️",
    severity: "high",
    score: 7.0,
    location: "Mandi, Himachal Pradesh",
    lat: 31.7084,
    lng: 76.9319,
    affected: 1200,
    source: "NDMA",
    timestamp: m(180),
    status: "active",
    summary: "Major landslide closing the highway. Diversion in place; restoration teams en route.",
  },
  {
    id: "AB-1036",
    title: "Air quality severely poor in Delhi NCR",
    category: "Air Quality",
    categoryIcon: "🏭",
    severity: "medium",
    score: 5.1,
    location: "New Delhi",
    lat: 28.6139,
    lng: 77.209,
    affected: 320000,
    source: "CPCB",
    timestamp: m(240),
    status: "active",
    summary: "AQI breached 420. Schools advised to limit outdoor activity.",
  },
  {
    id: "AB-1035",
    title: "Coastal flooding subsiding in Chennai",
    category: "Flood",
    categoryIcon: "🌊",
    severity: "low",
    score: 3.4,
    location: "Chennai, Tamil Nadu",
    lat: 13.0827,
    lng: 80.2707,
    affected: 5400,
    source: "TNDMA",
    timestamp: m(360),
    status: "resolved",
    summary: "Water levels receding. Cleanup operations active. Two relief camps remain open.",
  },
  {
    id: "AB-1034",
    title: "Hailstorm damages crops in Punjab",
    category: "Storm",
    categoryIcon: "⛈️",
    severity: "medium",
    score: 5.9,
    location: "Ludhiana, Punjab",
    lat: 30.901,
    lng: 75.8573,
    affected: 8200,
    source: "IMD",
    timestamp: m(420),
    status: "resolved",
    summary: "Brief but intense hailstorm. Agricultural assessment underway.",
  },
  {
    id: "AB-1033",
    title: "Industrial gas leak contained in Vizag",
    category: "Industrial",
    categoryIcon: "☣️",
    severity: "high",
    score: 6.8,
    location: "Visakhapatnam, Andhra Pradesh",
    lat: 17.6868,
    lng: 83.2185,
    affected: 2100,
    source: "AP-SDMA",
    timestamp: m(540),
    status: "resolved",
    summary: "Leak from chemical plant contained within 90 minutes. No fatalities reported.",
  },
];

export const severityMeta: Record<
  Severity,
  { label: string; color: string; soft: string; ring: string }
> = {
  critical: {
    label: "Critical",
    color: "hsl(var(--severity-critical))",
    soft: "hsl(var(--severity-critical-soft))",
    ring: "hsl(var(--severity-critical) / 0.35)",
  },
  high: {
    label: "High",
    color: "hsl(var(--severity-high))",
    soft: "hsl(var(--severity-high-soft))",
    ring: "hsl(var(--severity-high) / 0.35)",
  },
  medium: {
    label: "Medium",
    color: "hsl(var(--severity-medium))",
    soft: "hsl(var(--severity-medium-soft))",
    ring: "hsl(var(--severity-medium) / 0.35)",
  },
  low: {
    label: "Low",
    color: "hsl(var(--severity-low))",
    soft: "hsl(var(--severity-low-soft))",
    ring: "hsl(var(--severity-low) / 0.35)",
  },
};

export function timeAgo(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
