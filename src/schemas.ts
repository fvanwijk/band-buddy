import { z } from 'zod';

/**
 * Song schema (full, with id)
 */
export const songSchema = z.object({
  artist: z.string(),
  bpm: z.number().optional(),
  duration: z.string().optional(),
  id: z.string(),
  key: z.string(),
  timeSignature: z.string(),
  title: z.string(),
});

/**
 * Song table schema (without id, for Tinybase table)
 */
export const songTableSchema = z.object({
  artist: z.string(),
  bpm: z.number().optional(),
  duration: z.string().optional(),
  key: z.string(),
  timeSignature: z.string(),
  title: z.string(),
});

/**
 * Song without ID (for creating/updating)
 */
export const songWithoutIdSchema = songSchema.omit({ id: true });

/**
 * Setlist song schema (full, with id)
 */
export const setlistSongSchema = z.object({
  id: z.string(),
  isDeleted: z.boolean().default(false),
  setNumber: z.number(),
  setlistId: z.string(),
  songId: z.string(),
  songIndex: z.number(),
});

/**
 * Setlist song table schema (without id, for Tinybase table)
 */
export const setlistSongTableSchema = z.object({
  isDeleted: z.boolean().default(false),
  setNumber: z.number(),
  setlistId: z.string(),
  songId: z.string(),
  songIndex: z.number(),
});

/**
 * Setlist metadata schema (full, with id)
 */
export const setlistMetadataSchema = z.object({
  date: z.string(),
  id: z.string(),
  title: z.string(),
  venue: z.string().optional(),
});

/**
 * Setlist metadata table schema (without id, for Tinybase table)
 */
export const setlistMetadataTableSchema = z.object({
  date: z.string(),
  title: z.string(),
  venue: z.string().optional(),
});

/**
 * Song reference schema (for UI)
 */
export const songReferenceSchema = z.object({
  isDeleted: z.boolean().optional(),
  songId: z.string(),
});

/**
 * Setlist set schema (for UI)
 */
export const setlistSetSchema = z.object({
  setNumber: z.number(),
  songs: z.array(songReferenceSchema),
});

/**
 * Complete setlist schema (for UI)
 */
export const setlistSchema = z.object({
  date: z.string(),
  id: z.string(),
  sets: z.array(setlistSetSchema),
  title: z.string(),
  venue: z.string().optional(),
});

/**
 * Setlist without ID (for creating/updating)
 */
export const setlistWithoutIdSchema = setlistSchema.omit({ id: true });

/**
 * Settings values
 */
export const localeSchema = z.string().default('en-US');
export const themeSchema = z.string().default('emerald');
export const activeSetlistIdSchema = z.string();
