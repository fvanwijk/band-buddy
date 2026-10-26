import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { StoreProvider } from '../../store/StoreProvider';
import { getMockStore } from '../../testUtils';
import { LocaleCard } from './LocaleCard';

describe('LocaleCard', () => {
  const voices = [
    { default: true, lang: 'en-US', name: 'Samantha', voiceURI: 'samantha' },
    { lang: 'en-GB', name: 'Daniel', voiceURI: 'daniel' },
    { default: true, lang: 'nl-NL', name: 'Xander', voiceURI: 'xander' },
  ];

  const speak = vi.fn();

  beforeEach(() => {
    speak.mockClear();
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        text: string;
        constructor(text: string) {
          this.text = text;
        }
      },
    );
    vi.stubGlobal('speechSynthesis', {
      addEventListener: vi.fn(),
      cancel: vi.fn(),
      getVoices: () => voices,
      removeEventListener: vi.fn(),
      speak,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const renderComponent = async (values: Record<string, string> = {}) => {
    const { persister, store } = getMockStore();
    store.setValues(values);
    await persister.save();

    render(<LocaleCard />, { wrapper: StoreProvider });
    await screen.findByLabelText('English voice');
  };

  it('lists the voices per language with the default voice selected', async () => {
    await renderComponent();

    const english = screen.getByLabelText('English voice');
    expect(english).toHaveDisplayValue('Default (Samantha)');
    expect(screen.getByRole('option', { name: 'Daniel (en-GB)' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Xander (nl-NL)' })).toBeInTheDocument();
    expect(screen.getByLabelText('Dutch voice')).toHaveDisplayValue('Default (Xander)');
  });

  it('stores the selected voice per language', async () => {
    const user = userEvent.setup();
    await renderComponent();

    await user.selectOptions(screen.getByLabelText('English voice'), 'Daniel (en-GB)');

    expect(screen.getByLabelText('English voice')).toHaveDisplayValue('Daniel (en-GB)');
    expect(localStorage.getItem('band-buddy')).toContain('"ttsVoiceEn":"daniel"');
  });

  it('shows the default voice when the stored voice is unavailable', async () => {
    await renderComponent({ ttsVoiceEn: 'voice-of-another-device' });

    expect(screen.getByLabelText('English voice')).toHaveDisplayValue('Default (Samantha)');
  });

  it('plays a sample sentence with the selected voice', async () => {
    const user = userEvent.setup();
    await renderComponent({ ttsVoiceEn: 'daniel' });

    await user.click(screen.getByRole('button', { name: 'Play English voice' }));

    expect(speak).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'This voice is used to announce the song',
        voice: voices[1],
      }),
    );

    await user.click(screen.getByRole('button', { name: 'Play Dutch voice' }));

    expect(speak).toHaveBeenLastCalledWith(
      expect.objectContaining({
        text: 'Deze stem wordt gebruikt om het liedje aan te kondigen',
        voice: voices[2],
      }),
    );
  });
});
