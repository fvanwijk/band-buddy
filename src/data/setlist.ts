import type { Setlist } from '../types/setlist';

export const mockSetlist: Setlist = {
  date: '2026-01-31',
  id: 'setlist-2026-01-31',
  name: 'Evening Jazz Session',
  songs: [
    {
      artist: 'Bill Evans',
      id: 'song-01',
      key: 'F',
      timeSignature: '3/4',
      title: 'Waltz for Debby',
    },
    {
      artist: 'Herbie Hancock',
      id: 'song-02',
      key: 'Dm',
      timeSignature: '4/4',
      title: 'Maiden Voyage',
    },
    {
      artist: 'Chick Corea',
      id: 'song-03',
      key: 'Gm',
      timeSignature: '6/8',
      title: 'Spain',
    },
    {
      artist: 'Norah Jones',
      id: 'song-04',
      key: 'Bb',
      timeSignature: '4/4',
      title: "Don't Know Why",
    },
    {
      artist: 'Duke Ellington',
      id: 'song-05',
      key: 'Dm',
      timeSignature: '4/4',
      title: 'In a Sentimental Mood',
    },
    {
      artist: 'Miles Davis',
      id: 'song-06',
      key: 'Dm',
      timeSignature: '4/4',
      title: 'So What',
    },
  ],
  venue: 'Blue Note Studio',
};
