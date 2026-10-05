import { act, renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vite-plus/test';

import { emptySongFilters } from './filterSongs';
import type { SongFilters } from './filterSongs';
import { filterDefinitions } from './songFilterDefinitions';
import type { FilterId } from './songFilterDefinitions';
import { useActiveSongFilters } from './useActiveSongFilters';

describe('useActiveSongFilters', () => {
  const renderUseActiveSongFilters = () =>
    renderHook(() => {
      const form = useForm<SongFilters>({ defaultValues: emptySongFilters });
      return { active: useActiveSongFilters(form), form };
    });

  const getDefinition = (id: FilterId) =>
    filterDefinitions.find((definition) => definition.id === id)!;

  it('starts without active filters', () => {
    const { result } = renderUseActiveSongFilters();

    expect(result.current.active.activeIds).toEqual([]);
  });

  it('adds filters in the order they are added', () => {
    const { result } = renderUseActiveSongFilters();

    act(() => result.current.active.add('title'));
    act(() => result.current.active.add('key'));

    expect(result.current.active.activeIds).toEqual(['title', 'key']);
  });

  it('starts a has-filter on "yes"', () => {
    const { result } = renderUseActiveSongFilters();

    act(() => result.current.active.add('hasLyrics'));

    expect(result.current.form.getValues('hasLyrics')).toBe('yes');
  });

  it('removes a filter and clears its value', () => {
    const { result } = renderUseActiveSongFilters();
    act(() => result.current.active.add('title'));
    act(() => result.current.form.setValue('title', 'queen'));

    act(() => result.current.active.remove(getDefinition('title')));

    expect(result.current.active.activeIds).toEqual([]);
    expect(result.current.form.getValues('title')).toBe('');
  });

  it('unsets a has-filter when removing it', () => {
    const { result } = renderUseActiveSongFilters();
    act(() => result.current.active.add('hasLyrics'));

    act(() => result.current.active.remove(getDefinition('hasLyrics')));

    expect(result.current.form.getValues('hasLyrics')).toBeUndefined();
  });

  it('clears both bounds when removing the duration filter', () => {
    const { result } = renderUseActiveSongFilters();
    act(() => result.current.active.add('durationRange'));
    act(() => {
      result.current.form.setValue('durationMin', '2');
      result.current.form.setValue('durationMax', '5');
    });

    act(() => result.current.active.remove(getDefinition('durationRange')));

    expect(result.current.form.getValues('durationMin')).toBe('');
    expect(result.current.form.getValues('durationMax')).toBe('');
  });

  it('clears all filters, including the search', () => {
    const { result } = renderUseActiveSongFilters();
    act(() => result.current.active.add('artist'));
    act(() => {
      result.current.form.setValue('artist', 'queen');
      result.current.form.setValue('search', 'bohemian');
    });

    act(() => result.current.active.clear());

    expect(result.current.active.activeIds).toEqual([]);
    expect(result.current.form.getValues()).toEqual(emptySongFilters);
  });
});
