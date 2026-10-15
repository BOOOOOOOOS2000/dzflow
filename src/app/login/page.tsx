"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useThemeStore } from "@/store/theme";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useThemeStore();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Connexion impossible");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 dark:border-slate-600 dark:text-slate-300"
        >
          {theme === "dark" ? "☀️ Clair" : "🌙 Sombre"}
        </button>
      </div>
      <div className="card p-8">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white font-bold">DZ</div>
          <span className="text-xl font-semibold text-slate-900 dark:text-white">DZFlow</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Se connecter</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Accédez à votre espace de gestion.
        </p>
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full rounded-lg py-2.5 text-sm disabled:opacity-50"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Pas de compte ? <Link href="/register" className="text-primary-600 hover:underline">Créer un compte</Link>
        </p>
      </div>
    </main>
  );
}