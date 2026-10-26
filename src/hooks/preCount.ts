import fourUrl from '../assets/pre-count/four.wav?url';
import oneUrl from '../assets/pre-count/one.wav?url';
import threeUrl from '../assets/pre-count/three.wav?url';
import twoUrl from '../assets/pre-count/two.wav?url';

export type PreCountWord = 'four' | 'one' | 'three' | 'two';

const WORD_URLS: Record<PreCountWord, string> = {
  four: fourUrl,
  one: oneUrl,
  three: threeUrl,
  two: twoUrl,
};

const COUNTED_WORDS: PreCountWord[] = ['one', 'two', 'three', 'four'];

/** The pre count lasts two measures: a slow "one, two" followed by a full count. */
export const getPreCountBeats = (beatsPerMeasure: number) => beatsPerMeasure * 2;

// Compound meters (6/8, 9/8, 12/8) are counted per group of three beats
const isCompound = (beatsPerMeasure: number) => beatsPerMeasure > 3 && beatsPerMeasure % 3 === 0;

/**
 * Word to speak on a pre count beat (0-based), or null for silence.
 * 4/4: "one . two . | one two three four".
 * 3/4: "one two three | one two three".
 * 6/8: "one . . two . . | one two three two two three".
 * Only four words are recorded, so beats after the fourth in other long measures are not spoken.
 */
export const getPreCountWord = (beat: number, beatsPerMeasure: number): PreCountWord | null => {
  if (beatsPerMeasure === 3) {
    return COUNTED_WORDS[beat % 3] ?? null;
  }

  const compound = isCompound(beatsPerMeasure);

  if (beat < beatsPerMeasure) {
    if (beat === 0) {
      return 'one';
    }

    const secondWordBeat = compound
      ? 3 * Math.ceil(beatsPerMeasure / 6)
      : Math.ceil(beatsPerMeasure / 2);
    return beatsPerMeasure > 1 && beat === secondWordBeat ? 'two' : null;
  }

  const countBeat = beat - beatsPerMeasure;
  if (compound) {
    const group = Math.floor(countBeat / 3);
    const positionInGroup = countBeat % 3;
    return COUNTED_WORDS[positionInGroup === 0 ? group : positionInGroup] ?? null;
  }

  return COUNTED_WORDS[countBeat] ?? null;
};

let buffersPromise: Promise<Record<PreCountWord, AudioBuffer>> | null = null;

export const loadPreCountBuffers = (ctx: AudioContext) => {
  buffersPromise ??= Promise.all(
    COUNTED_WORDS.map(async (word) => {
      const response = await fetch(WORD_URLS[word]);
      const buffer = await ctx.decodeAudioData(await response.arrayBuffer());
      return [word, buffer] as const;
    }),
  )
    .then((entries) => Object.fromEntries(entries) as Record<PreCountWord, AudioBuffer>)
    .catch((error: unknown) => {
      buffersPromise = null;
      throw error;
    });

  return buffersPromise;
};
