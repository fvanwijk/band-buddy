import { Key, Note } from 'tonal';

type TargetSpelling = {
  preferFlats: boolean;
  scaleNotes: Map<number, string>;
};

const normalizeSymbols = (value: string) => value.replace(/♭/g, 'b').replace(/♯/g, '#');

const CHORD_PATTERN = /^([A-G][#b]?)(.*?)(?:\/([A-G][#b]?))?$/;
const KEY_PATTERN = /^([A-G][#b]?)(m|min|minor)?$/i;

const getKeyInfo = (tonic: string, isMinor: boolean) =>
  isMinor ? Key.minorKey(tonic) : Key.majorKey(tonic);

const getScaleNotes = (tonic: string, isMinor: boolean) => {
  const info = isMinor ? Key.minorKey(tonic).natural : Key.majorKey(tonic);
  return new Map(info.scale.map((note) => [Note.chroma(note), note] as const));
};

/**
 * Determines how notes should be spelled after transposing: the transposed key is
 * spelled with the fewest accidentals (e.g. F# - 1 => F instead of E#).
 */
const getTargetSpelling = (songKey: string, transpose: number): TargetSpelling | null => {
  const match = KEY_PATTERN.exec(normalizeSymbols(songKey.trim()));
  if (!match) {
    return null;
  }

  const [, tonicRaw, quality] = match;
  const tonic = tonicRaw.charAt(0).toUpperCase() + tonicRaw.slice(1);
  const isMinor = !!quality;
  const sourceChroma = Note.chroma(tonic);
  const sourceAlteration = getKeyInfo(tonic, isMinor).alteration;
  const targetChroma = (((sourceChroma + transpose) % 12) + 12) % 12;
  const sharpTonic = Note.pitchClass(Note.fromMidiSharps(60 + targetChroma));
  const flatTonic = Note.pitchClass(Note.fromMidi(60 + targetChroma));
  const sharpAlteration = Math.abs(getKeyInfo(sharpTonic, isMinor).alteration);
  const flatAlteration = Math.abs(getKeyInfo(flatTonic, isMinor).alteration);

  let targetTonic = sharpTonic;
  if (
    flatAlteration < sharpAlteration ||
    (flatAlteration === sharpAlteration && sourceAlteration < 0)
  ) {
    targetTonic = flatTonic;
  }

  return {
    preferFlats: getKeyInfo(targetTonic, isMinor).alteration < 0,
    scaleNotes: getScaleNotes(targetTonic, isMinor),
  };
};

const transposeNote = (note: string, transpose: number, spelling: TargetSpelling | null) => {
  const chroma = (((Note.chroma(note) + transpose) % 12) + 12) % 12;
  const scaleNote = spelling?.scaleNotes.get(chroma);
  if (scaleNote) {
    return scaleNote;
  }

  const preferFlats = spelling ? spelling.preferFlats : note.endsWith('b');
  return Note.pitchClass(
    preferFlats ? Note.fromMidi(60 + chroma) : Note.fromMidiSharps(60 + chroma),
  );
};

/**
 * Transposes a chord by a number of semitones, spelling it for the transposed song key.
 *
 * This intentionally does not use tonal's `Chord.transpose`: that transposes by an interval, and
 * `Interval.fromSemitones` always yields the same interval (and thus spelling) per semitone count,
 * regardless of key. F# - 1 gives E# instead of F, and D - 1 gives C# instead of Db.
 * Respelling its result afterwards (`Note.simplify`) would fix E# but not C#, and would still need
 * the key-aware logic below, so it would not be simpler.
 *
 * Instead the target key is spelled with the fewest accidentals (F# - 1 => F, C + 1 => Db) and
 * chord roots/basses are spelled with that key's notes. tonal is still used for key and note data.
 * Without a song key, the accidental style (sharp or flat) of the original chord is kept.
 */
export const transposeChord = (value: string, transpose: number, songKey?: string) => {
  const normalized = normalizeSymbols(value);

  if (transpose === 0) {
    return normalized;
  }

  const match = CHORD_PATTERN.exec(normalized);
  if (!match) {
    return normalized;
  }

  const [, root, suffix, bass] = match;
  const spelling = songKey ? getTargetSpelling(songKey, transpose) : null;
  const transposedBass = bass ? `/${transposeNote(bass, transpose, spelling)}` : '';

  return `${transposeNote(root, transpose, spelling)}${suffix}${transposedBass}`;
};
