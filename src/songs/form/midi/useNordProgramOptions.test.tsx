import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useNordProgramOptions } from './useNordProgramOptions';

describe('useNordProgramOptions', () => {
  it('returns 8 banks with 64 programs each', () => {
    const { result } = renderHook(() => useNordProgramOptions());

    expect(result.current).toHaveLength(8);
    expect(result.current[0].label).toBe('Bank A');
    expect(result.current[7].label).toBe('Bank H');
    expect(result.current[0].options).toHaveLength(64);
  });

  it('formats program labels with bank, display value, and absolute number', () => {
    const { result } = renderHook(() => useNordProgramOptions());

    const firstOption = result.current[0].options[0];
    const lastOption = result.current[0].options[63];

    expect(firstOption.label).toBe('A-11 (0)');
    expect(firstOption.value).toBe('0');
    expect(lastOption.label).toBe('A-88 (63)');
    expect(lastOption.value).toBe('63');
  });
});
