export type ThemeName = 'emerald' | 'orange' | 'violet';

export const THEMES = {
  emerald: {
    color: 'emerald',
    name: 'Emerald',
  },
  orange: {
    color: 'orange',
    name: 'Orange',
  },
  violet: {
    color: 'violet',
    name: 'Violet',
  },
} as const;

export const DEFAULT_THEME: ThemeName = 'emerald';

export function applyTheme(themeName: ThemeName) {
  document.documentElement.setAttribute('data-theme', themeName);
}
