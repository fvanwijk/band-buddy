import type { Song } from '../types/setlist';

export const createSong = (overrides: Partial<Song> = {}): Song => ({
  artist: 'Queen',
  bpm: 72,
  id: '1',
  key: 'Bb',
  timeSignature: '4/4',
  title: 'Bohemian Rhapsody',
  ...overrides,
});

export const createSongs = (): Song[] => [
  createSong(),
  createSong({
    artist: 'Earth, Wind & Fire',
    bpm: 126,
    id: '2',
    key: 'Ab',
    title: 'September',
  }),
  createSong({
    artist: 'Stevie Wonder',
    bpm: 100,
    id: '3',
    key: 'Ebm',
    title: 'Superstition',
  }),
  createSong({
    artist: 'Michael Jackson',
    bpm: 117,
    id: '4',
    key: 'F#m',
    title: 'Billie Jean',
  }),
  createSong({
    artist: 'Journey',
    bpm: 119,
    id: '5',
    key: 'E',
    title: "Don't Stop Believin'",
  }),
  createSong({
    artist: 'Fleetwood Mac',
    bpm: 120,
    id: '6',
    key: 'F',
    title: 'Dreams',
  }),
  createSong({
    artist: 'Aretha Franklin',
    bpm: 115,
    id: '7',
    key: 'C',
    title: 'Respect',
  }),
  createSong({
    artist: 'Billy Joel',
    bpm: 90,
    id: '8',
    key: 'C',
    timeSignature: '3/4',
    title: 'Piano Man',
  }),
  createSong({
    artist: 'The Beatles',
    bpm: 76,
    id: '9',
    key: 'C',
    title: 'Let It Be',
  }),
  createSong({
    artist: 'Prince',
    bpm: 63,
    id: '10',
    title: 'Purple Rain',
  }),
];
