import type { Tables, Values } from 'tinybase';
import { z, ZodError } from 'zod';

import { migrateV1ToV2 } from './v1-to-v2/migration';

/**
 * Migrate backup from input version to the current app version (2)
 * Runs all necessary migrations sequentially
 */
export function migrateBackup(
  input: unknown,
  inputVersion: number,
): {
  tables: Tables;
  values: Values;
  error?: string;
} {
  const CURRENT_VERSION = 2;

  if (inputVersion < 1) {
    return { error: 'Invalid backup version', tables: {}, values: {} };
  }

  if (inputVersion === CURRENT_VERSION) {
    // No migration needed
    const parsed = z
      .object({
        tables: z.record(z.string(), z.record(z.string(), z.unknown())),
        values: z.record(z.string(), z.unknown()).optional(),
      })
      .parse(input);

    return {
      tables: parsed.tables as Tables,
      values: (parsed.values || {}) as Values,
    };
  }

  if (inputVersion > CURRENT_VERSION) {
    return {
      error: `Backup version ${inputVersion} is newer than app version ${CURRENT_VERSION}`,
      tables: {},
      values: {},
    };
  }

  try {
    let current: unknown = input;

    // Run migrations sequentially
    if (inputVersion <= 1 && CURRENT_VERSION >= 2) {
      const result = migrateV1ToV2(current);
      current = { tables: result.tables, values: result.values, version: 2 };
    }

    // Final parse and normalize
    const final = z
      .object({
        tables: z.record(z.string(), z.record(z.string(), z.unknown())),
        values: z.record(z.string(), z.unknown()).optional(),
      })
      .parse(current);

    return {
      tables: final.tables as Tables,
      values: (final.values || {}) as Values,
    };
  } catch (error) {
    // Generic error message for schema validation failures
    if (error instanceof ZodError) {
      return {
        error: 'The backup file format is invalid or corrupted.',
        tables: {},
        values: {},
      };
    }

    const message = error instanceof Error ? error.message : 'Unknown migration error';
    return { error: `Migration failed: ${message}`, tables: {}, values: {} };
  }
}
