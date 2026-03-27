import type { Tables, Values } from 'tinybase';
import { z, ZodError } from 'zod';

import { CURRENT_BACKUP_VERSION, resolvePersistedStoreVersion } from './persistedStoreVersion';
import { migrateV1ToV2 } from './v1-to-v2/migration';

const CURRENT_VERSION = CURRENT_BACKUP_VERSION;

const persistedStoreSchema = z.tuple([
  z.record(z.string(), z.record(z.string(), z.unknown())),
  z.record(z.string(), z.unknown()).optional(),
]);

export function migratePersistedStore(
  input: string | null,
  rawVersion: string | null,
): {
  error?: string;
  migrated: boolean;
  persisted: string | null;
} {
  if (!input) {
    return {
      migrated: false,
      persisted: input,
    };
  }

  try {
    const parsed = persistedStoreSchema.parse(JSON.parse(input));
    const [tables, rawValues] = parsed;
    const values = (rawValues || {}) as Values;
    const inputVersion = resolvePersistedStoreVersion(rawVersion, tables as Tables);

    if (inputVersion === CURRENT_VERSION) {
      return {
        migrated: false,
        persisted: input,
      };
    }

    const result = migrateBackup(
      {
        tables,
        values,
        version: inputVersion,
      },
      inputVersion,
    );

    if (result.error) {
      return {
        error: result.error,
        migrated: false,
        persisted: input,
      };
    }

    return {
      migrated: true,
      persisted: JSON.stringify([result.tables, result.values]),
    };
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return {
        error: 'The stored app data is invalid or corrupted.',
        migrated: false,
        persisted: input,
      };
    }

    const message = error instanceof Error ? error.message : 'Unknown migration error';
    return {
      error: `Migration failed: ${message}`,
      migrated: false,
      persisted: input,
    };
  }
}

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
