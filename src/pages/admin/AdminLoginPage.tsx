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
    <main className="grid min-h-screen place-items-center bg-brand-background px-5 py-10 text-pink-950">
      <section className="w-full max-w-md rounded-2xl bg-white/90 p-6 shadow-soft">
        <div className="grid size-14 place-items-center rounded-full bg-brand-secondary text-brand-accent">
          <Icon icon="mdi:shield-account-outline" className="size-8" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold text-brand-accent">Admin Login</h1>
        <p className="mt-3 text-sm leading-6 text-pink-950/70">
          Sign in with an owner username or email from Supabase Auth. This page is
          intentionally not linked from the public navigation.
        </p>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <input
            className="input-field"
            type="text"
            placeholder="Owner username or email"
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            required
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
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

