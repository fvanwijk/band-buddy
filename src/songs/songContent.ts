import type { Song } from '../types';

// Eraser strokes (drawMode: false) and strokes without points don't leave visible content behind
const hasDrawing = (paths: unknown[] | undefined) =>
  !!paths?.some((path) => {
    const { drawMode, paths: points } = (path ?? {}) as { drawMode?: boolean; paths?: unknown[] };
    return drawMode !== false && !!points?.length;
  });

// Lyrics can only be drawn on when they exist, so their drawings are ignored
export const songHasLyrics = (song: Song) => !!song.lyrics?.trim();

// The text notes tab can always be drawn on, so drawings count as text notes
export const songHasTextNotes = (song: Song) =>
  !!song.notes?.trim() || hasDrawing(song.textNotesCanvasPaths);
