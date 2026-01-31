export type Song = {
  id: string;
  artist: string;
  title: string;
  key: string;
  timeSignature: string;
};

export type Setlist = {
  id: string;
  name: string;
  date: string;
  venue: string;
  songs: Song[];
};
