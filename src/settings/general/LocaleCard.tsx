import { useGetLocale, useSetLocale } from '../../api/useSettings';
import { SUPPORTED_LOCALES, type SupportedLocale } from '../../config/locales';
import { SelectField } from '../../ui/form/SelectField';
import { GridCell } from '../GridCell';
import { TtsVoiceSelect } from './TtsVoiceSelect';

export function LocaleCard() {
  const currentLocale = useGetLocale();
  const setLocale = useSetLocale();

  return (
    <GridCell>
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

      <h3 className="mt-8 text-base font-semibold text-slate-100">Speech voices</h3>
      <p className="mt-2 text-sm text-slate-400">
        Voices used to announce song titles before the pre count. The English voice is also used for
        cues and the spoken count. The available voices depend on your browser and device.
      </p>
      <div className="mt-4 space-y-4">
        <TtsVoiceSelect label="English voice" language="en" />
        <TtsVoiceSelect label="Dutch voice" language="nl" />
      </div>
    </GridCell>
  );
}
