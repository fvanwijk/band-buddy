import { useGetTheme, useSetTheme } from '../../api/useSettings';
import { THEMES, type ThemeName } from '../../config/themes';
import { Button } from '../../ui/Button';
import { SettingsCard } from '../SettingsCard';

// Color preview swatches for each theme
const themeColors = {
  emerald: {
    '200': 'oklch(0.905 0.093 164.15)',
    '400': 'oklch(0.765 0.177 163.223)',
    '600': 'oklch(0.596 0.145 163.225)',
  },
  orange: {
    '200': 'oklch(0.901 0.076 70.697)',
    '400': 'oklch(0.75 0.183 55.934)',
    '600': 'oklch(0.646 0.222 41.116)',
  },
  violet: {
    '200': 'oklch(0.894 0.057 293.283)',
    '400': 'oklch(0.702 0.183 293.541)',
    '600': 'oklch(0.541 0.281 293.009)',
  },
} as const;

export function ColorThemeCard() {
  const currentTheme = useGetTheme();
  const setTheme = useSetTheme();

  return (
    <SettingsCard>
      <h2 className="text-lg font-semibold text-slate-100">Color Theme</h2>
      <p className="mt-2 text-sm text-slate-400">
        Choose your preferred color scheme. Based on triadic color harmony.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {Object.entries(THEMES).map(([key, theme]) => {
          const themeName = key as ThemeName;
          const isActive = currentTheme === themeName;

          return (
            <Button
              key={themeName}
              onClick={() => setTheme(themeName)}
              className={[
                'group relative block! overflow-hidden rounded-xl border p-3! text-left transition',
                isActive
                  ? 'border-brand-400 bg-brand-400/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600',
              ].join(' ')}
              variant="ghost"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-100">{theme.name}</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {isActive ? 'Active theme' : 'Click to activate'}
                  </p>
                </div>

                {isActive && (
                  <div className="bg-brand-400/20 flex h-5 w-5 items-center justify-center rounded-full">
                    <svg
                      className="text-brand-300 h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                {(['200', '400', '600'] as const).map((shade) => (
                  <div
                    key={shade}
                    className="h-8 flex-1 rounded"
                    style={{
                      backgroundColor: themeColors[themeName][shade],
                    }}
                  />
                ))}
              </div>
            </Button>
          );
        })}
      </div>
    </SettingsCard>
  );
}
