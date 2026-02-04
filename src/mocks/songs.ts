import type { Song } from '../types';

export const createSong = (overrides: Partial<Song> = {}): Song => ({
  artist: 'Queen',
  bpm: 72,
  duration: 355,
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
    duration: 215,
    id: '2',
    key: 'Ab',
    title: 'September',
  }),
  createSong({
    artist: 'Stevie Wonder',
    bpm: 100,
    duration: 267,
    id: '3',
    key: 'Ebm',
    title: 'Superstition',
  }),
  createSong({
    artist: 'Michael Jackson',
    bpm: 117,
    duration: 294,
    id: '4',
    key: 'F#m',
    title: 'Billie Jean',
  }),
  createSong({
    artist: 'Journey',
    bpm: 119,
    duration: 251,
    id: '5',
    key: 'E',
    title: "Don't Stop Believin'",
  }),
  createSong({
    artist: 'Fleetwood Mac',
    bpm: 120,
    duration: 268,
    id: '6',
    key: 'F',
    title: 'Dreams',
  }),
  createSong({
    artist: 'Aretha Franklin',
    bpm: 115,
    duration: 152,
    id: '7',
    key: 'C',
    title: 'Respect',
  }),
  createSong({
    artist: 'Billy Joel',
    bpm: 90,
    duration: 339,
    id: '8',
    key: 'C',
    timeSignature: '3/4',
    title: 'Piano Man',
  }),
  createSong({
    artist: 'The Beatles',
    bpm: 76,
    duration: 230,
    id: '9',
    key: 'C',
    title: 'Let It Be',
  }),
  createSong({
    artist: 'Prince',
    bpm: 63,
    duration: 522,
    id: '10',
    title: 'Purple Rain',
  }),
];

export const createLyrics = (): string => `[Verse 1]
 
B                      G#m
 Music is a world with-in itself,
       G                     F#
With a language we all under-stand.
B                    G#m
 With an equal oppor-tunity,
           G                           F# F7
For all to sing, dance, and clap their ha-nds.
 
 
Page 1/5
[Bridge 1]
 
            E9      D#9    D9    C#9
But just be-cause a record has a groove,
      D9      D#9    E9
Don't make it in the groove.
            E9           D#9    D9     C#9
But you can tell right a-way at letter A,
         D9  D#9 E9    F9 F#9  F#7
When the peo-ple start to move.
 
 
[Chorus 1]
 
B                     Fm7-5 Emaj7                 C#m9 E/F#
 They can feel it all over, they can feel it all over people.
B                     Fm7-5 Emaj7                 C#m9 E/F#
 They can feel it all over, they can feel it all over people.
 
 
[Interlude]
 
 
[Verse 2]
 
B                      G#m
 Music knows it is and always will,
Page 2/5
          G                               F#
Be one of the things that life just won't quit.
B                             G#m
 But here are some of music's pioneers,
               G                   F#  F7
That time will not allow us to for-get;
 
 
[Bridge 2]
 
            E9     D#9     D9    C#9
For there's Basie, Miller, Satch-mo,
        D9      D#9      E9
And the King of all, Sir Duke.
           E9         D#9    D9      C#9
And with a voice like Ella's ringing out,
           D9  D#9 E9   F9  F#9  F#7
There's no way the band can lose.
 
 
[Chorus 2]
 
B                    Fm7-5 Emaj7                C#m9 E/F#
 You can feel it all over, you can feel it all over people.
B                    Fm7-5 Emaj7                C#m9 E/F#
 You can feel it all over, you can feel it all over people.
B                    Fm7-5 Emaj7                C#m9 E/F#
 You can feel it all over, you can feel it all over people.
B                    Fm7-5 Emaj7                C#m9 E/F#
 You can feel it all over, you can feel it all over people.
 
 
[Interlude]
 
 
 
[Chorus 3]
 
B                    Fm7-5 Emaj7                C#m9 E/F#
 You can feel it all over, you can feel it all over people.
B                    Fm7-5 Emaj7                C#m9 E/F#
 You can feel it all over, you can feel it all over people.
B                    Fm7-5 Emaj7                C#m9 E/F#
 You can feel it all over, you can feel it all over people.
B                    Fm7-5 Emaj7              C#m9        E/F#
 You can feel it all over, I can feel it all over, all o-ver now, people.
 
B                     Fm7-5 Emaj7                   C#m9     E/F#
 They can feel it all over, come on; let's feel it all over people.
B                    Fm7-5 Emaj7          C#m9 E/F#
 You can feel it all over, everybody all over people.
 
 
[Outro]`;
