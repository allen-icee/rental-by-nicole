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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-barbie animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-pink-950/40 transition hover:bg-brand-background hover:text-brand-accent"
        >
          <Icon icon="mdi:close" className="size-5" />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <div className="grid size-12 place-items-center rounded-full bg-brand-background text-brand-accent shadow-soft">
            <Icon icon="mdi:shield-key-outline" className="size-6" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold text-brand-accent">Admin Access</h2>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <input
            className="input-field"
            type="text"
            placeholder="Username or email"
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
