import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("ams-theme") || "dark",
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("ams-theme", newTheme);
      return { theme: newTheme };
    }),
}));
