import type { SongDetailTab } from '../../../schemas';

export function resolveAutoSongTab(
  songRow: Record<string, unknown> | null | undefined,
): SongDetailTab {
  if (typeof songRow?.lyrics === 'string' && songRow.lyrics.trim().length > 0) {
    return 'lyrics';
  }

  if (
    typeof songRow?.sheetMusicFilename === 'string' &&
    songRow.sheetMusicFilename.trim().length > 0
  ) {
    return 'sheet-music';
  }

  if (typeof songRow?.notes === 'string' && songRow.notes.trim().length > 0) {
    return 'text-notes';
  }

  if (Array.isArray(songRow?.midiEvents) && songRow.midiEvents.length > 0) {
    return 'midi';
  }

  if (typeof songRow?.midiEvents === 'string') {
    try {
      const parsedMidiEvents = JSON.parse(songRow.midiEvents) as unknown;
      if (Array.isArray(parsedMidiEvents) && parsedMidiEvents.length > 0) {
        return 'midi';
      }
    } catch {
      // Ignore invalid persisted MIDI event payloads and continue falling back.
    }
  }

  return 'lyrics';
}
