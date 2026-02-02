import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useProgramOptions } from './useProgramOptions';
import { createInstrument } from '../mocks/instruments';

type GroupOption = { label: string; options: Array<{ label: string; value: string }> };

type FlatOption = { label: string; value: string };

describe('useProgramOptions', () => {
  it('returns empty options for non-Nord instruments without program names', () => {
    const instrument = createInstrument();

    const { result } = renderHook(() => useProgramOptions(instrument));

    expect(result.current).toEqual([]);
  });

  it('returns grouped Nord options when no program names are defined', () => {
    const instrument = createInstrument({ name: 'Nord Stage' });

    const { result } = renderHook(() => useProgramOptions(instrument));

    const groups = result.current as GroupOption[];
    expect(groups).toHaveLength(8);
    expect(groups[0].label).toBe('Bank A');
    expect(groups[0].options).toHaveLength(64);
  });

  it('returns flat options with custom program names for non-Nord instruments', () => {
    const instrument = createInstrument({
      name: 'Yamaha',
      programNames: {
        0: 'Piano',
        2: 'E.Piano',
      },
    });

    const { result } = renderHook(() => useProgramOptions(instrument));

    const options = result.current as FlatOption[];
    expect(options).toHaveLength(2);
    expect(options[0]).toEqual({ label: '0: Piano', value: '0' });
    expect(options[1]).toEqual({ label: '2: E.Piano', value: '2' });
  });

  it('appends custom names to Nord program labels', () => {
    const instrument = createInstrument({
      name: 'Nord Stage',
      programNames: {
        0: 'Bright',
        64: 'Pad',
      },
    });

    const { result } = renderHook(() => useProgramOptions(instrument));

    const groups = result.current as GroupOption[];
    expect(groups[0].options[0].label).toBe('A-11 (0) Bright');

    const bankB = groups.find((group) => group.label === 'Bank B');
    expect(bankB?.options[0].label).toBe('B-11 (64) Pad');
  });
});
