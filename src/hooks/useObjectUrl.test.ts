import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { useObjectUrl } from './useObjectUrl';

describe('useObjectUrl', () => {
  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null when file is null', () => {
    const { result } = renderHook(() => useObjectUrl(null));

    expect(result.current).toBeNull();
  });

  it('returns null when file is undefined', () => {
    const { result } = renderHook(() => useObjectUrl(undefined));

    expect(result.current).toBeNull();
  });

  it('creates an object URL for a File', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    const { result } = renderHook(() => useObjectUrl(file));

    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(result.current).toBe('blob:mock-url');
  });

  it('creates an object URL for a Blob', () => {
    const blob = new Blob(['content'], { type: 'text/plain' });

    const { result } = renderHook(() => useObjectUrl(blob));

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(result.current).toBe('blob:mock-url');
  });

  it('revokes the object URL on unmount', () => {
    const file = new File(['content'], 'test.txt');

    const { unmount } = renderHook(() => useObjectUrl(file));

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('revokes old URL and creates new URL when file changes', () => {
    const file1 = new File(['a'], 'a.txt');
    const file2 = new File(['b'], 'b.txt');

    vi.spyOn(URL, 'createObjectURL')
      .mockReturnValueOnce('blob:url-1')
      .mockReturnValueOnce('blob:url-2');

    const { rerender, result } = renderHook(({ file }) => useObjectUrl(file), {
      initialProps: { file: file1 as File | null },
    });

    expect(result.current).toBe('blob:url-1');

    rerender({ file: file2 });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:url-1');
    expect(result.current).toBe('blob:url-2');
  });

  it('revokes URL when file changes to null', () => {
    const file = new File(['content'], 'test.txt');

    const { rerender, result } = renderHook(({ file }) => useObjectUrl(file), {
      initialProps: { file: file as File | null },
    });

    expect(result.current).toBe('blob:mock-url');

    rerender({ file: null });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    expect(result.current).toBeNull();
  });
});
