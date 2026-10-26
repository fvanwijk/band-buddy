import { useEffect, useState } from 'react';

export type SpeechLanguage = 'en' | 'nl';

const getSynth = () => (typeof window === 'undefined' ? undefined : window.speechSynthesis);

export const getVoicesForLanguage = (
  voices: SpeechSynthesisVoice[],
  language: SpeechLanguage,
): SpeechSynthesisVoice[] =>
  voices.filter((voice) => {
    const voiceLanguage = voice.lang.toLowerCase().replace('_', '-');
    return voiceLanguage === language || voiceLanguage.startsWith(`${language}-`);
  });

/**
 * The voice with the given URI, or when it isn't available in this browser (for example after
 * importing settings from another device) the browser's default voice for the language, or else
 * the first voice for the language.
 */
export const resolveVoice = (
  voices: SpeechSynthesisVoice[],
  language: SpeechLanguage,
  voiceURI?: string,
): SpeechSynthesisVoice | undefined => {
  const languageVoices = getVoicesForLanguage(voices, language);

  return (
    languageVoices.find((voice) => voiceURI && voice.voiceURI === voiceURI) ??
    languageVoices.find((voice) => voice.default) ??
    languageVoices[0]
  );
};

/** Voices available in this browser for a language. Browsers load their voices asynchronously. */
export const useSpeechVoices = (language: SpeechLanguage): SpeechSynthesisVoice[] => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => getSynth()?.getVoices() ?? []);

  useEffect(() => {
    const synth = getSynth();
    if (!synth) {
      return;
    }

    const updateVoices = () => setVoices(synth.getVoices());
    updateVoices();
    synth.addEventListener('voiceschanged', updateVoices);

    return () => synth.removeEventListener('voiceschanged', updateVoices);
  }, []);

  return getVoicesForLanguage(voices, language);
};
