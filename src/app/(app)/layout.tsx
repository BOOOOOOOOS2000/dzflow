"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useThemeStore } from "@/store/theme";
import {
  LayoutDashboard,
  Users,
  FileText,
  Package,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/invoices", label: "Factures", icon: FileText },
  { href: "/products", label: "Produits", icon: Package },
  { href: "/pipeline", label: "Pipeline", icon: Users },
  { href: "/settings", label: "Paramètres", icon: Settings },
] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname() || "";
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-surface-muted dark:bg-surface-dark flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-200 dark:bg-surface-dark 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        aria-label="Navigation principale"
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-surface-border dark:border-surface-dark-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white font-bold">
              DZ
            </div>
            <span className="text-xl font-semibold text-slate-900 dark:text-white">DZFlow</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1" role="navigation">
          {NAV.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition
                  ${isActive
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-surface-border dark:border-surface-dark-border">
          <button
            onClick={() =>
              setTheme(theme === "dark" ? "light" : theme === "light" ? "system" : "dark")
            }
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label={`Thème actuel : ${theme}`}
          >
            {theme === "dark" ? (
              <Moon className="h-5 w-5" />
            ) : theme === "light" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Monitor className="h-5 w-5" />
            )}
            <span>
              {theme === "dark"
                ? "Mode sombre"
                : theme === "light"
                  ? "Mode clair"
                  : "Système"}
            </span>
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-surface-border bg-white/80 px-4 backdrop-blur dark:border-surface-dark-border dark:bg-surface-dark/80">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-slate-500 dark:text-slate-400">
              {new Date().toLocaleDateString("fr-DZ", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}