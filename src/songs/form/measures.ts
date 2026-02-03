import { parseDuration } from '../../utils/duration';

/**
 * Calculate number of measures based on duration, BPM, and time signature
 * Returns null if any required value is missing or invalid
 */
export function calculateMeasures(
  duration: string | undefined,
  bpm: number | undefined,
  timeSignature: string | undefined,
): number | null {
  if (!duration || !bpm || !timeSignature) return null;

  const totalSeconds = parseDuration(duration);
  if (totalSeconds === null) return null;

  // Extract beats per measure from time signature (e.g., "4/4" -> 4)
  const beatsPerMeasure = parseInt(timeSignature.split('/')[0], 10);
  if (isNaN(beatsPerMeasure)) return null;

  // Calculate beats per second
  const beatsPerSecond = bpm / 60;

  // Calculate total beats
  const totalBeats = totalSeconds * beatsPerSecond;

  // Calculate measures
  const measures = totalBeats / beatsPerMeasure;

  return Math.round(measures);
}
