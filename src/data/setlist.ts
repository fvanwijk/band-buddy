import type { Setlist } from "../types/setlist";

export const mockSetlist: Setlist = {
  id: "setlist-2026-01-31",
  name: "Evening Jazz Session",
  date: "2026-01-31",
  venue: "Blue Note Studio",
  songs: [
    {
      id: "song-01",
      artist: "Bill Evans",
      title: "Waltz for Debby",
      key: "F",
      timeSignature: "3/4",
    },
    {
      id: "song-02",
      artist: "Herbie Hancock",
      title: "Maiden Voyage",
      key: "Dm",
      timeSignature: "4/4",
    },
    {
      id: "song-03",
      artist: "Chick Corea",
      title: "Spain",
      key: "Gm",
      timeSignature: "6/8",
    },
    {
      id: "song-04",
      artist: "Norah Jones",
      title: "Don't Know Why",
      key: "Bb",
      timeSignature: "4/4",
    },
    {
      id: "song-05",
      artist: "Duke Ellington",
      title: "In a Sentimental Mood",
      key: "Dm",
      timeSignature: "4/4",
    },
    {
      id: "song-06",
      artist: "Miles Davis",
      title: "So What",
      key: "Dm",
      timeSignature: "4/4",
    },
  ],
};
