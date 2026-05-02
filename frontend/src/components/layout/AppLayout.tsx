import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  Bell,
  ShieldAlert,
  LogOut,
  Search,
  Radio,
} from "lucide-react";
import { useAlerts } from "@/store/useAlerts";
import { useEffect, useState } from "react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/map", label: "Crisis Map", icon: Map },
  { to: "/cap-feed", label: "CAP Feed", icon: Radio },
  { to: "/about", label: "About", icon: ShieldAlert },
];

export default function AppLayout() {
  const { signOut, alerts } = useAlerts();
  const navigate = useNavigate();
  const loc = useLocation();
  const [online, setOnline] = useState(true);

  // Fake "live" indicator pulse
  useEffect(() => {
    const id = setInterval(() => setOnline((v) => v), 5000);
    return () => clearInterval(id);
  }, []);

  const newCount = alerts.filter((a) => a.status === "new").length;
  const title = navItems.find((n) => loc.pathname.startsWith(n.to))?.label ?? "";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 hidden md:flex flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border">
          <img 
            src="/alertbeacon.png" 
            alt="AlertBeacon" 
            className="h-10 w-auto object-contain"
          />
          <div className="leading-tight">
            <div className="font-display font-bold text-base brand-text">ALERTBEACON</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Autonomous Crisis & Need Response Agent
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all border-l-2 ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border-primary font-medium"
                    : "text-sidebar-foreground border-transparent hover:bg-sidebar-accent/60 hover:border-primary/40"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {to === "/alerts" && newCount > 0 && (
                <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary text-primary-foreground">
                  {newCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={() => {
              signOut();
              navigate("/");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-sidebar-accent/60 transition"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur flex items-center px-5 gap-4">
          <h1 className="font-display text-lg font-semibold tracking-wide hidden sm:block">
            {title}
          </h1>

          <div className="flex-1 max-w-md mx-auto relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search alerts, locations, sources..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary placeholder:text-muted-foreground/70"
            />
          </div>

          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
              online
                ? "bg-severity-low-soft text-severity-low border-severity-low/30"
                : "bg-severity-critical-soft text-severity-critical border-severity-critical/30"
            }`}
          >
            <Radio className="h-3 w-3" />
            <span className="tracking-wider uppercase">{online ? "Live" : "Offline"}</span>
            <span className="live-dot" />
          </div>

          <button className="relative h-9 w-9 grid place-items-center rounded-xl border border-border bg-card hover:bg-accent transition">
            <Bell className="h-4 w-4" />
            {newCount > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] h-4 min-w-4 px-1 grid place-items-center rounded-full bg-severity-critical text-primary-foreground font-bold">
                {newCount}
              </span>
            )}
          </button>

          <div className="h-9 w-9 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-semibold text-sm">
            AB
          </div>
        </header>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
