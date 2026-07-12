// src/components/admin/AdminLoginModal.tsx
import { useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/toast-context";
import { signInOwner } from "@/services/auth.service";

type AdminLoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

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
    onClose();
    navigate("/admin", { replace: true });
  }

  return (
    <div className="fixed top-0 left-0 z-[100] flex w-full h-[100svh] items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm rounded-[2rem] bg-white/90 p-8 shadow-barbie border border-white/50 backdrop-blur-md animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-pink-950/40 transition hover:bg-brand-background hover:text-brand-accent"
        >
          <Icon icon="mdi:close" className="size-5" />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <div className="grid size-16 place-items-center rounded-full bg-brand-secondary text-brand-accent shadow-inner mb-2">
            <Icon icon="mdi:shield-crown-outline" className="size-8" />
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold text-brand-accent">Admin Access</h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-pink-950/70 mb-4">
            Sign in with an owner account. This portal is strictly restricted.
          </p>
        </div>

        <form className="mt-4 grid gap-5" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2 text-left block w-full">
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
          
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-accent ml-2 block w-full">
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
          {message && (
            <p className="rounded-xl bg-pink-50 px-4 py-3 text-xs font-bold text-brand-accent text-center">
              {message}
            </p>
          )}
          <button
            className="mt-2 w-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent px-6 py-3.5 font-bold text-white shadow-soft transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Unlock Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
