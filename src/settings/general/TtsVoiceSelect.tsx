import { IconPlayerPlayFilled } from '@tabler/icons-react';
import { useEffect, useId, useRef } from 'react';
import type { FC } from 'react';

import { useGetPreCountVolume, useGetTtsVoice, useSetTtsVoice } from '../../api/useSettings';
import { speakText } from '../../hooks/speakText';
import { type SpeechLanguage, resolveVoice, useSpeechVoices } from '../../hooks/speechVoices';
import { Button } from '../../ui/Button';
import { FormLabel } from '../../ui/form/FormLabel';
import { SelectField } from '../../ui/form/SelectField';

const SAMPLE_TEXT: Record<SpeechLanguage, string> = {
  en: 'This voice is used to announce the song',
  nl: 'Deze stem wordt gebruikt om het liedje aan te kondigen',
};

type TtsVoiceSelectProps = {
  label: string;
  language: SpeechLanguage;
};

export const TtsVoiceSelect: FC<TtsVoiceSelectProps> = ({ label, language }) => {
  const voices = useSpeechVoices(language);
  const selectedVoiceURI = useGetTtsVoice(language);
  const setVoice = useSetTtsVoice(language);
  const preCountVolume = useGetPreCountVolume();
  const selectId = useId();
  const cancelSpeechRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cancelSpeechRef.current?.(), []);

  const handlePlay = () => {
    cancelSpeechRef.current?.();
    cancelSpeechRef.current = speakText(SAMPLE_TEXT[language], {
      language,
      onDone: () => {
        cancelSpeechRef.current = null;
      },
      voiceURI: selectedVoiceURI,
      // The pre count volume may be off, but the user still wants to hear the voice
      volume: preCountVolume > 0 ? preCountVolume : 100,
    });
  };

  // A stored voice that's unavailable in this browser shows as the default voice
  const value = voices.some((voice) => voice.voiceURI === selectedVoiceURI)
    ? (selectedVoiceURI ?? '')
    : '';
  const defaultVoice = resolveVoice(voices, language);

  // The label sits outside the row so the button stretches to the exact height of the select.
  // Its width (w-9.75 = 39px) matches that height to make it a circle.
  return (
    <div>
      <FormLabel className="mb-1.5 block" htmlFor={selectId}>
        {label}
      </FormLabel>
      <div className="flex items-stretch gap-2">
        <div className="min-w-0 flex-1">
          <SelectField
            hideLabel
            id={selectId}
            label={label}
            onChange={(event) => setVoice(event.target.value)}
            options={[
              { label: defaultVoice ? `Default (${defaultVoice.name})` : 'Default', value: '' },
              ...voices.map((voice) => ({
                label: `${voice.name} (${voice.lang})`,
                value: voice.voiceURI,
              })),
            ]}
            value={value}
          />
        </div>
        <Button
          aria-label={`Play ${label}`}
          isIcon
          onClick={handlePlay}
          title={`Play ${label}`}
          type="button"
          variant="outlined"
        >
          <IconPlayerPlayFilled className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
