export type Song = {
  artist: string;
  bpm?: number;
  duration?: string;
  id: string;
  key: string;
  timeSignature: string;
  title: string;
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
  date: string;
  id: string;
  sets: SetlistSet[];
  title: string;
  venue?: string;
};
