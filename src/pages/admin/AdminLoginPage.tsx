// src/pages/admin/AdminLoginPage.tsx
import { useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/toast-context";
import { signInOwner } from "@/services/auth.service";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function AdminLoginPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from?.pathname ?? "/admin";
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await signInOwner(login, password);

    setLoading(false);

    if (error) {
      setMessage(error.message);
      showToast({ tone: "error", title: "Sign in failed", message: error.message });
      return;
    }

    showToast({ tone: "success", title: "Welcome back", message: "Owner dashboard unlocked." });
    navigate(from, { replace: true });
  }

  return (
    <main className="grid min-h-[100svh] place-items-center bg-brand-background px-5 py-10 text-pink-950">
      <section className="w-full max-w-md rounded-[2rem] bg-white/90 p-8 shadow-barbie border border-white/50 backdrop-blur-md">
        <div className="grid size-16 place-items-center rounded-full bg-brand-secondary text-brand-accent shadow-inner mb-6">
          <Icon icon="mdi:shield-crown-outline" className="size-8" />
        </div>
        <h1 className="font-display text-3xl font-bold text-brand-accent">Admin Login</h1>
        <p className="mt-2 text-sm font-medium leading-relaxed text-pink-950/70 mb-8">
          Sign in with an owner account. This portal is strictly restricted to authorized personnel.
        </p>
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2">
              Username or Email
            </label>
            <input
              type="text"
              placeholder="admin@rental.com"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              required
              className="w-full rounded-xl border-2 border-brand-secondary/40 bg-white/50 px-4 py-3 text-sm font-medium text-pink-950 shadow-inner transition-all focus:border-brand-primary focus:bg-white focus:outline-none focus:shadow-crystal focus:ring-4 focus:ring-brand-primary/10 placeholder:text-pink-950/30"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-xl border-2 border-brand-secondary/40 bg-white/50 px-4 py-3 pr-12 text-sm font-medium text-pink-950 shadow-inner transition-all focus:border-brand-primary focus:bg-white focus:outline-none focus:shadow-crystal focus:ring-4 focus:ring-brand-primary/10 placeholder:text-pink-950/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-brand-accent/40 hover:text-brand-primary focus:outline-none transition-colors"
                tabIndex={-1}
              >
                <Icon icon={showPassword ? "mingcute:eye-line" : "mingcute:eye-close-line"} className="size-5" />
              </button>
            </div>
          </div>
          {message ? (
            <p className="rounded-2xl bg-pink-50 px-4 py-3 text-sm font-semibold text-brand-accent">
              {message}
            </p>
          ) : null}
          <button
            className="rounded-full bg-brand-accent px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <Link to="/" className="mt-5 inline-flex font-semibold text-brand-accent">
          Back to website
        </Link>
      </section>
    </main>
  );
}

