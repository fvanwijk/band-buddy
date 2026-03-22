import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { useSortedArray } from './useSortedArray';

type Item = {
  bpm: number;
  id: string;
  title: string;
};

const items: Item[] = [
  { bpm: 126, id: '2', title: 'September' },
  { bpm: 72, id: '1', title: 'Bohemian Rhapsody' },
  { bpm: 100, id: '3', title: 'superstition' },
];

describe('useSortedArray', () => {
  it('returns original items when sortBy is null', () => {
    const { result } = renderHook(() => useSortedArray(items, null, 'asc'));

    expect(result.current).toBe(items);
  });

  it('returns original items when sort direction is none', () => {
    const { result } = renderHook(() => useSortedArray(items, 'title', 'none'));

    expect(result.current).toBe(items);
  });

  it('sorts strings ascending case-insensitively', () => {
    const { result } = renderHook(() => useSortedArray(items, 'title', 'asc'));

    expect(result.current.map((item) => item.title)).toEqual([
      'Bohemian Rhapsody',
      'September',
      'superstition',
    ]);
  });

  it('sorts numbers descending', () => {
    const { result } = renderHook(() => useSortedArray(items, 'bpm', 'desc'));

    expect(result.current.map((item) => item.bpm)).toEqual([126, 100, 72]);
  });

  it('supports custom compare value', () => {
    const { result } = renderHook(() =>
      useSortedArray(items, 'title', 'asc', (item) => item.title.length),
    );

    expect(result.current.map((item) => item.title)).toEqual([
      'September',
      'superstition',
      'Bohemian Rhapsody',
    ]);
  });

  it('does not mutate original array when sorting', () => {
    const originalTitles = items.map((item) => item.title);

    const { result } = renderHook(() => useSortedArray(items, 'title', 'asc'));

    expect(result.current).not.toBe(items);
    expect(items.map((item) => item.title)).toEqual(originalTitles);
  });
});
