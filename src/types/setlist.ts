export type Song = {
  id: string;
  artist: string;
  title: string;
  key: string;
  timeSignature: string;
  bpm?: number;
};

export type Setlist = {
  id: string;
  name: string;
  date: string;
  venue: string;
  songs: Song[];
};
