import type { FieldError } from 'react-hook-form';

import type { MidiEvent } from '../../../types';

export type FormData = Omit<MidiEvent, 'id'>;
export type MidiAction = MidiEvent['events'][number];
export type MidiActionType = 'controlChange' | 'nrpn' | 'programChange';
export type RowErrors = Record<string, FieldError | undefined> | undefined;
