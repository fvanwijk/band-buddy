import { SelectField } from './SelectField';
import { SettingsCard } from './SettingsCard';
import { SUPPORTED_LOCALES, type SupportedLocale } from '../config/locales';
import { useGetLocale, useSetLocale } from '../hooks/useSettings';

export function LocaleCard() {
  const currentLocale = useGetLocale();
  const setLocale = useSetLocale();

  return (
    <SettingsCard>
      <h2 className="text-lg font-semibold text-slate-100">Locale</h2>
      <p className="mt-2 text-sm text-slate-400">
        Select your preferred locale for date and number formatting.
      </p>

      <div className="mt-6">
        <SelectField
          id="locale-select"
          label="Locale"
          options={SUPPORTED_LOCALES.map(({ locale, name }) => ({
            label: name,
            value: locale,
          }))}
          value={currentLocale}
          onChange={(locale) => setLocale(locale as SupportedLocale)}
        />
      </div>
    </SettingsCard>
  );
}
