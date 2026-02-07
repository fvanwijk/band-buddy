import { useEffect, useState } from 'react';
import { Input, Output, WebMidi } from 'webmidi';

type MidiDevicesState = {
  error: string | null;
  inputs: Input[];
  isReady: boolean;
  isSupported: boolean;
  outputs: Output[];
};

export function useMidiDevices(): MidiDevicesState {
  const [inputs, setInputs] = useState<Input[]>([]);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initMidi = async () => {
      try {
        await WebMidi.enable({ sysex: true });
        if (!isMounted) return;

        setInputs(WebMidi.inputs);
        setOutputs(WebMidi.outputs);
        setIsSupported(true);
        setIsReady(true);
        setError(null);

        WebMidi.addListener('connected', () => {
          if (!isMounted) return;

          setInputs(WebMidi.inputs);
          setOutputs(WebMidi.outputs);
        });

        WebMidi.addListener('disconnected', () => {
          if (!isMounted) return;

          setInputs(WebMidi.inputs);
          setOutputs(WebMidi.outputs);
        });
      } catch (err) {
        if (!isMounted) return;

        setIsSupported(false);
        setIsReady(false);
        setError(err instanceof Error ? err.message : 'MIDI access is unavailable or was denied.');
      }
    };

    initMidi();

    return () => {
      isMounted = false;
      WebMidi.removeListener('connected');
      WebMidi.removeListener('disconnected');
    };
  }, []);

  return {
    error,
    inputs,
    isReady,
    isSupported,
    outputs,
  };
}
