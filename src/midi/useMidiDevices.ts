import { useEffect, useState } from 'react';
import { WebMidi } from 'webmidi';

type MidiDevice = {
  id: string;
  name: string;
};

type MidiDevicesState = {
  error: string | null;
  inputs: MidiDevice[];
  isReady: boolean;
  isSupported: boolean;
  outputs: MidiDevice[];
};

export function useMidiDevices(): MidiDevicesState {
  const [inputs, setInputs] = useState<MidiDevice[]>([]);
  const [outputs, setOutputs] = useState<MidiDevice[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initMidi = async () => {
      try {
        await WebMidi.enable({ sysex: true });
        if (!isMounted) return;

        const nextInputs = WebMidi.inputs.map((input) => ({
          id: input.id,
          name: input.name,
        }));

        const nextOutputs = WebMidi.outputs.map((output) => ({
          id: output.id,
          name: output.name,
        }));

        setInputs(nextInputs);
        setOutputs(nextOutputs);
        setIsSupported(true);
        setIsReady(true);
        setError(null);

        WebMidi.addListener('connected', () => {
          if (!isMounted) return;

          setInputs(
            WebMidi.inputs.map((input) => ({
              id: input.id,
              name: input.name,
            })),
          );
          setOutputs(
            WebMidi.outputs.map((output) => ({
              id: output.id,
              name: output.name,
            })),
          );
        });

        WebMidi.addListener('disconnected', () => {
          if (!isMounted) return;

          setInputs(
            WebMidi.inputs.map((input) => ({
              id: input.id,
              name: input.name,
            })),
          );
          setOutputs(
            WebMidi.outputs.map((output) => ({
              id: output.id,
              name: output.name,
            })),
          );
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
