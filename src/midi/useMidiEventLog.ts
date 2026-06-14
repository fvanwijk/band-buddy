import { useCallback, useEffect, useState } from 'react';
import type { ControlChangeMessageEvent, Input, MessageEvent, NoteMessageEvent } from 'webmidi';

import {
  shouldSuppressInputMidiMessage,
  subscribeMidiEventLog,
  type MidiEventLogEntry,
} from './midiEventLogBus';
import { useMidiDevices } from './useMidiDevices';

export type { MidiEventLogEntry };

const MAX_LOG_ENTRIES = 500;

type ListenerEntry = {
  device: Input;
  eventType: keyof import('webmidi').InputEventMap;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listener: (e: any) => void;
};

export function useMidiEventLog(enabled: boolean) {
  const [entries, setEntries] = useState<MidiEventLogEntry[]>([]);
  const { inputs, isReady } = useMidiDevices();

  const addEntry = useCallback((entry: MidiEventLogEntry) => {
    setEntries((prev) => {
      const updated = [entry, ...prev];
      return updated.length > MAX_LOG_ENTRIES ? updated.slice(0, MAX_LOG_ENTRIES) : updated;
    });
  }, []);

  const clearLog = useCallback(() => {
    setEntries([]);
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    return subscribeMidiEventLog((entry) => {
      addEntry(entry);
    });
  }, [addEntry, enabled]);

  // Capture incoming MIDI events (for hardware/controllers sending to the app).
  useEffect(() => {
    if (!enabled || !isReady || inputs.length === 0) {
      return;
    }

    const listeners: ListenerEntry[] = [];

    inputs.forEach((input) => {
      const programChangeListener = (e: MessageEvent) => {
        const data = Array.from(e.rawData);
        if (shouldSuppressInputMidiMessage({ data, deviceId: input.id })) {
          return;
        }

        addEntry({
          channels: e.message.channel !== undefined ? [e.message.channel] : [],
          data,
          deviceId: input.id,
          deviceName: input.name,
          direction: 'in',
          timestamp: Date.now(),
          type: 'programChange',
          value: e.rawValue,
        });
      };

      const controlChangeListener = (e: ControlChangeMessageEvent) => {
        const data = Array.from(e.rawData);
        if (shouldSuppressInputMidiMessage({ data, deviceId: input.id })) {
          return;
        }

        addEntry({
          channels: e.message.channel !== undefined ? [e.message.channel] : [],
          data,
          deviceId: input.id,
          deviceName: input.name,
          direction: 'in',
          timestamp: Date.now(),
          type: 'cc',
          value: e.controller.number,
        });
      };

      const noteOnListener = (e: NoteMessageEvent) => {
        const data = Array.from(e.rawData);
        if (shouldSuppressInputMidiMessage({ data, deviceId: input.id })) {
          return;
        }

        addEntry({
          channels: e.message.channel !== undefined ? [e.message.channel] : [],
          data,
          deviceId: input.id,
          deviceName: input.name,
          direction: 'in',
          timestamp: Date.now(),
          type: 'noteOn',
          value: e.note.number,
        });
      };

      const noteOffListener = (e: NoteMessageEvent) => {
        const data = Array.from(e.rawData);
        if (shouldSuppressInputMidiMessage({ data, deviceId: input.id })) {
          return;
        }

        addEntry({
          channels: e.message.channel !== undefined ? [e.message.channel] : [],
          data,
          deviceId: input.id,
          deviceName: input.name,
          direction: 'in',
          timestamp: Date.now(),
          type: 'noteOff',
          value: e.note.number,
        });
      };

      input.addListener('controlchange', controlChangeListener);
      input.addListener('noteoff', noteOffListener);
      input.addListener('noteon', noteOnListener);
      input.addListener('programchange', programChangeListener);

      listeners.push(
        { device: input, eventType: 'controlchange', listener: controlChangeListener },
        { device: input, eventType: 'noteoff', listener: noteOffListener },
        { device: input, eventType: 'noteon', listener: noteOnListener },
        { device: input, eventType: 'programchange', listener: programChangeListener },
      );
    });

    return () => {
      listeners.forEach(({ device, eventType, listener }) => {
        device.removeListener(eventType, listener);
      });
    };
  }, [addEntry, enabled, inputs, isReady]);

  return {
    clearLog,
    entries,
  };
}
