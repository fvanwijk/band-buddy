/**
 * Convert tick to milliseconds
 * @param tick - Current tick position
 * @param bpm - Beats per minute
 * @param timebase - Number of ticks per quarter note (typically 480)
 * @returns Milliseconds equivalent of the tick duration
 */
export function tickToMillisec(tick: number, bpm: number, timebase: number) {
  return (tick / (timebase / 60) / bpm) * 1000;
}
