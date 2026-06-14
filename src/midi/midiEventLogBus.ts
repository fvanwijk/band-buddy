export type MidiEventLogEntry = {
  channels: number[];
  data: number[];
  direction: 'in' | 'out';
  deviceId: string;
  deviceName: string;
  timestamp: number;
  type: 'cc' | 'noteOn' | 'noteOff' | 'programChange' | 'unknown';
  value?: number;
};

type MidiMessageSource = 'sequencer' | 'song-event';

type RegisterOutboundMidiMessageParams = {
  channels: number[];
  data: number[];
  deviceId: string;
  deviceName: string;
  emitLogEntry: boolean;
  source: MidiMessageSource;
  timestamp?: number;
  type: MidiEventLogEntry['type'];
  value?: number;
};

type SuppressInputMidiMessageParams = {
  data: number[];
  deviceId: string;
  timestamp?: number;
};

type RecentOutboundMessage = {
  deviceId: string;
  signature: string;
  source: MidiMessageSource;
  timestamp: number;
};

const MAX_RECENT_OUTBOUND_MESSAGES = 200;
const RECENT_MESSAGE_WINDOW_MS = 300;

const listeners = new Set<(entry: MidiEventLogEntry) => void>();
const recentOutboundMessages: RecentOutboundMessage[] = [];

function getMidiMessageSignature(data: number[]): string {
  const status = data[0] ?? -1;
  const dataByte1 = data[1] ?? -1;
  const command = status & 0xf0;

  if (command === 0x80 || command === 0x90 || command === 0xb0) {
    return `${status}:${dataByte1}`;
  }

  if (command === 0xc0) {
    return `${status}:${dataByte1}`;
  }

  return data.join(':');
}

function pruneRecentOutboundMessages(now: number) {
  while (recentOutboundMessages.length > 0) {
    const oldest = recentOutboundMessages[0];
    if (now - oldest.timestamp <= RECENT_MESSAGE_WINDOW_MS) {
      break;
    }

    recentOutboundMessages.shift();
  }

  if (recentOutboundMessages.length > MAX_RECENT_OUTBOUND_MESSAGES) {
    recentOutboundMessages.splice(0, recentOutboundMessages.length - MAX_RECENT_OUTBOUND_MESSAGES);
  }
}

export function subscribeMidiEventLog(listener: (entry: MidiEventLogEntry) => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function registerOutboundMidiMessage({
  channels,
  data,
  deviceId,
  deviceName,
  emitLogEntry,
  source,
  timestamp = Date.now(),
  type,
  value,
}: RegisterOutboundMidiMessageParams) {
  const normalizedData = [...data];
  const signature = getMidiMessageSignature(normalizedData);

  // Track each channel separately for suppression matching.
  channels.forEach((ch) => {
    recentOutboundMessages.push({
      deviceId,
      signature: `${ch}:${signature}`,
      source,
      timestamp,
    });
  });
  if (channels.length === 0) {
    recentOutboundMessages.push({ deviceId, signature, source, timestamp });
  }
  pruneRecentOutboundMessages(timestamp);

  if (!emitLogEntry) {
    return;
  }

  const entry: MidiEventLogEntry = {
    channels,
    data: normalizedData,
    deviceId,
    deviceName,
    direction: 'out',
    timestamp,
    type,
    value,
  };

  listeners.forEach((listener) => {
    listener(entry);
  });
}

export function shouldSuppressInputMidiMessage({
  data,
  deviceId,
  timestamp = Date.now(),
}: SuppressInputMidiMessageParams) {
  pruneRecentOutboundMessages(timestamp);

  const base = getMidiMessageSignature(data);
  // Channel-keyed signatures use 'ch:base', channel-less use just 'base'.
  return recentOutboundMessages.some(
    (message) =>
      message.source === 'sequencer' &&
      message.deviceId === deviceId &&
      (message.signature === base || message.signature.endsWith(`:${base}`)) &&
      timestamp - message.timestamp <= RECENT_MESSAGE_WINDOW_MS,
  );
}
