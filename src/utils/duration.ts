/**
 * Parse duration string in format "mm:ss" to total seconds
 */
export function parseDuration(duration: string | undefined): number {
  if (!duration) return 0;

  const parts = duration.split(':');
  if (parts.length !== 2) return 0;

  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);

  if (isNaN(minutes) || isNaN(seconds) || seconds >= 60) return 0;

  return minutes * 60 + seconds;
}

/**
 * Format seconds to "Xh Ym Zs" format (e.g., "1h 5m 30s" or "5m 30s")
 * @deprecated Use FormattedDuration component instead for styled output
 */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '—';

  const hours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
}
