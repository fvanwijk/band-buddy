export type MidiEvent = {
  id: string;
  instrumentId: string;
  label: string;
  programChange: number;
};

export type Song = {
  artist: string;
  bpm?: number;
  duration?: number;
  id: string;
  isDeleted?: boolean;
  key: string;
  lyrics?: string;
  midiEvents?: MidiEvent[];
  timeSignature: string;
  title: string;
  transpose?: number;
};

export type Instrument = {
  id: string;
  midiInId: string;
  midiInName: string;
  midiOutId?: string;
  midiOutName?: string;
  name: string;
  programNames?: Record<number, string>;
};

export type SongReference = {
  songId: string;
};

export type SetlistSet = {
  setNumber: number;
  songs: SongReference[];
};

export type Setlist = {
  date: string;
  id: string;
  sets: SetlistSet[];
  title: string;
  venue?: string;
};
