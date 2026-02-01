/**
 * Parse duration string in format "mm:ss" to total seconds
 */
export function parseDuration(duration: string): number | null {
  const parts = duration.split(':');
  if (parts.length !== 2) return null;

  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);

  if (isNaN(minutes) || isNaN(seconds) || seconds >= 60) return null;

  return minutes * 60 + seconds;
}

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
