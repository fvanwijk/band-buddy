export type ThemeName = "emerald" | "orange" | "violet";

export const TRIADIC_THEMES = {
  emerald: {
    name: "Emerald",
    color: "emerald",
  },
  orange: {
    name: "Orange",
    color: "orange",
  },
  violet: {
    name: "Violet",
    color: "violet",
  },
} as const;

export const DEFAULT_THEME: ThemeName = "emerald";

export function applyTheme(themeName: ThemeName) {
  document.documentElement.setAttribute("data-theme", themeName);
  localStorage.setItem("gig-buddy-theme", themeName);
}

export function getStoredTheme(): ThemeName {
  const stored = localStorage.getItem("gig-buddy-theme");
  return (stored as ThemeName) || DEFAULT_THEME;
}
