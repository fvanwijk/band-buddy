import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSortState } from './useSortState';

describe('useSortState', () => {
  it('cycles sort direction for the same field', () => {
    const { result } = renderHook(() => useSortState<'artist' | 'title'>('title', 'asc'));

    expect(result.current.sortBy).toBe('title');
    expect(result.current.sortDirection).toBe('asc');
    expect(result.current.isActive('title')).toBe(true);

    act(() => {
      result.current.handleSort('title');
    });

    expect(result.current.sortBy).toBe('title');
    expect(result.current.sortDirection).toBe('desc');

    act(() => {
      result.current.handleSort('title');
    });

    expect(result.current.sortBy).toBe(null);
    expect(result.current.sortDirection).toBe('none');
    expect(result.current.isActive('title')).toBe(false);
  });

  it('starts ascending when a new field is selected', () => {
    const { result } = renderHook(() => useSortState<'artist' | 'title'>(null));

    expect(result.current.sortBy).toBe(null);
    expect(result.current.sortDirection).toBe('none');

    act(() => {
      result.current.handleSort('artist');
    });

    expect(result.current.sortBy).toBe('artist');
    expect(result.current.sortDirection).toBe('asc');
  });
});
