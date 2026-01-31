export type Song = {
  id: string;
  artist: string;
  title: string;
  key: string;
  timeSignature: string;
  bpm?: number;
};

export type SongReference = {
  songId: string;
  isDeleted?: boolean;
};

export type SetlistSet = {
  setNumber: number;
  songs: SongReference[];
};

export type Setlist = {
  id: string;
  date: string;
  sets: SetlistSet[];
  title: string;
};
