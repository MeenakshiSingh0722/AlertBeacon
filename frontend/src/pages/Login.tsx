import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Mail, Lock, ArrowRight, Sparkles, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useAlerts } from "@/store/useAlerts";

export default function Login() {
  const { signIn, loading } = useAlerts();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@alertbeacon.io");
  const [pw, setPw] = useState("admin123");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setError("");
    
    try {
      await signIn({ email, password: pw });
      setState("ok");
      setTimeout(() => nav("/dashboard"), 500);
    } catch (err) {
      setState("error");
      setError("Authentication failed. Please check your credentials.");
    }
  };

  const demo = () => {
    setEmail("admin@alertbeacon.io");
    setPw("admin123");
    setTimeout(() => submit(new Event("submit") as any), 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Soft glow blobs */}
      <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-primary-glow/15 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[440px] animate-fade-up">
        {/* Brand */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-primary shadow-card mb-3">
            <ShieldAlert className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold brand-text tracking-wide">ALERTBEACON</h1>
          <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            Autonomous Crisis Command Center
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-severity-low-soft border border-severity-low/30 text-severity-low text-[11px] font-medium uppercase tracking-wider">
            <span className="live-dot" />
            System online · all agents active
          </div>
        </div>

        {/* Card */}
        <div className="soft-card p-7 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-12 w-12 border-t-2 border-l-2 border-primary/40 rounded-tl-2xl" />
          <div className="absolute bottom-0 right-0 h-12 w-12 border-b-2 border-r-2 border-primary-glow/40 rounded-br-2xl" />

          <h2 className="font-display text-xl font-semibold mb-1">Sign in to console</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Use your responder credentials to access the live feed.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <Field label="Operator email" icon={<Mail className="h-4 w-4" />}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent outline-none text-sm"
              />
            </Field>
            <Field label="Access key" icon={<Lock className="h-4 w-4" />}>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="w-full bg-transparent outline-none text-sm"
              />
            </Field>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || state === "loading"}
              className="w-full h-11 rounded-xl bg-gradient-primary text-primary-foreground font-semibold tracking-wider text-sm uppercase shadow-card hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-90"
            >
              {loading || state === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Authenticating...
                </>
              ) : state === "ok" ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Access granted
                </>
              ) : (
                <>
                  Access console <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={demo}
              className="w-full h-11 rounded-xl border border-primary/30 text-primary font-semibold tracking-wider text-sm uppercase hover:bg-primary-soft transition flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" /> Launch demo mode
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Inspired by NDMA Sachet — built for first responders.
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block mb-1.5 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
        {label}
      </span>
      <span className="flex items-center gap-2 px-3 h-11 rounded-xl border border-input bg-card focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30 transition">
        <span className="text-muted-foreground">{icon}</span>
        {children}
      </span>
    </label>
  );
}
