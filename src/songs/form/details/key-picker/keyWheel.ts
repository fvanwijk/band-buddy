export type KeyQuality = '' | 'm';

export type KeySlice = {
  count: number;
  endAngle: number;
  id: string;
  index: number;
  note: string;
  position: number;
  quality: KeyQuality;
  startAngle: number;
};

const SEMITONES: Record<string, number> = { A: 9, B: 11, C: 0, D: 2, E: 4, F: 5, G: 7 };
const POSITION_ANGLE = 30;

// Circle of fifths, clockwise from the top. Enharmonic spellings share a position;
// the first spelling is the default.
const MAJOR_POSITIONS = [
  ['C'],
  ['G'],
  ['D'],
  ['A'],
  ['E'],
  ['B'],
  ['F#', 'Gb'],
  ['Db', 'C#'],
  ['Ab'],
  ['Eb'],
  ['Bb'],
  ['F'],
];

// Relative minors, so each minor key sits right next to the major key sharing its key signature.
const MINOR_POSITIONS = [
  ['A'],
  ['E'],
  ['B'],
  ['F#'],
  ['C#'],
  ['G#', 'Ab'],
  ['D#', 'Eb'],
  ['Bb', 'A#'],
  ['F'],
  ['C'],
  ['G'],
  ['D'],
];

// Enharmonic spellings are stacked radially within the same angular range.
const buildSlices = (positions: string[][], quality: KeyQuality): KeySlice[] =>
  positions.flatMap((notes, position) =>
    notes.map((note, index) => ({
      count: notes.length,
      endAngle: position * POSITION_ANGLE + POSITION_ANGLE / 2,
      id: `${note}${quality}`,
      index,
      note,
      position,
      quality,
      startAngle: position * POSITION_ANGLE - POSITION_ANGLE / 2,
    })),
  );

export const majorSlices = buildSlices(MAJOR_POSITIONS, '');
export const minorSlices = buildSlices(MINOR_POSITIONS, 'm');

export const formatKey = (note: string, quality: KeyQuality) =>
  `${note.replace('#', '♯').replace(/(?<=.)b/, '♭')}${quality}`;

const getSemitone = (note: string) => {
  const base = SEMITONES[note.charAt(0)];
  if (base === undefined) {
    return undefined;
  }
  const accidental = note.charAt(1);
  return (base + (accidental === '#' ? 1 : accidental === 'b' ? 11 : 0)) % 12;
};

// Finds the slice on the same pitch as a stored key. The spelling is not always the same
// (e.g. a stored "G#" maps to the A♭ slice), so compare `slice.note` to the stored note
// to know whether the key is shown exactly as stored.
export const findSlice = (note?: string, quality?: string): KeySlice | undefined => {
  if (!note) {
    return undefined;
  }
  const slices = quality === 'm' ? minorSlices : majorSlices;

  const exact = slices.find((slice) => slice.note === note);
  if (exact) {
    return exact;
  }

  const semitone = getSemitone(note);
  if (semitone === undefined) {
    return undefined;
  }
  const relativeMajor = quality === 'm' ? (semitone + 3) % 12 : semitone;
  const position = (relativeMajor * 7) % 12;
  return slices.find((slice) => slice.position === position && slice.index === 0);
};

// Angles are in degrees, clockwise from the top.
export const getPolarPoint = (center: number, radius: number, angle: number) => {
  const radians = (angle * Math.PI) / 180;
  return {
    x: Math.round((center + radius * Math.sin(radians)) * 100) / 100,
    y: Math.round((center - radius * Math.cos(radians)) * 100) / 100,
  };
};

export const getSlicePath = (
  center: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
) => {
  const outerStart = getPolarPoint(center, outerRadius, startAngle);
  const outerEnd = getPolarPoint(center, outerRadius, endAngle);
  const innerEnd = getPolarPoint(center, innerRadius, endAngle);
  const innerStart = getPolarPoint(center, innerRadius, startAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 0 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
};
