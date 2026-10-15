import { create } from "zustand";

type Theme = "light" | "dark" | "system";

interface ThemeStore {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("dzflow-theme") as Theme) || "system";
};

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  root.classList.toggle("dark", dark);
};

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    localStorage.setItem("dzflow-theme", theme);
    applyTheme(theme);
    set({ theme });
  },
}));

export { applyTheme };
