import { useGetLocale, useSetLocale } from '../../api/useSettings';
import { SUPPORTED_LOCALES, type SupportedLocale } from '../../config/locales';
import { SelectField } from '../../ui/form/SelectField';
import { SettingsCard } from '../SettingsCard';

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
          label="Locale"
          options={SUPPORTED_LOCALES.map(({ locale, name }) => ({
            label: name,
            value: locale,
          }))}
          onChange={(event) => setLocale(event.target.value as SupportedLocale)}
          value={currentLocale}
        />
      </div>
    </SettingsCard>
  );
}
