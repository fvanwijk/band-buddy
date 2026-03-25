import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { useDrawingCursor } from './useDrawingCursor';

const makeMockOverlayRef = (rect: Partial<DOMRect> = {}) => {
  const element = document.createElement('div');
  element.getBoundingClientRect = () =>
    ({
      bottom: 0,
      height: 100,
      left: 10,
      right: 110,
      top: 20,
      width: 100,
      ...rect,
    }) as DOMRect;
  return { current: element };
};

const makeMockMouseEvent = (clientX: number, clientY: number) =>
  ({ clientX, clientY }) as React.MouseEvent<HTMLElement>;

describe('useDrawingCursor', () => {
  it('initializes with null cursor position', () => {
    const { result } = renderHook(() => useDrawingCursor('pen', makeMockOverlayRef(), 4, 20));

    expect(result.current.cursorPosition).toBeNull();
  });

  it('updates cursor position on mouse move in pen mode', () => {
    const overlayRef = makeMockOverlayRef({ left: 10, top: 20 });
    const { result } = renderHook(() => useDrawingCursor('pen', overlayRef, 4, 20));

    act(() => {
      result.current.handleMouseMove(makeMockMouseEvent(50, 80));
    });

    expect(result.current.cursorPosition).toEqual({ x: 40, y: 60 });
  });

  it('updates cursor position on mouse move in eraser mode', () => {
    const overlayRef = makeMockOverlayRef({ left: 0, top: 0 });
    const { result } = renderHook(() => useDrawingCursor('eraser', overlayRef, 4, 20));

    act(() => {
      result.current.handleMouseMove(makeMockMouseEvent(30, 50));
    });

    expect(result.current.cursorPosition).toEqual({ x: 30, y: 50 });
  });

  it('does not update cursor position in idle mode', () => {
    const overlayRef = makeMockOverlayRef();
    const { result } = renderHook(() => useDrawingCursor('idle', overlayRef, 4, 20));

    act(() => {
      result.current.handleMouseMove(makeMockMouseEvent(50, 80));
    });

    expect(result.current.cursorPosition).toBeNull();
  });

  it('clears cursor position on mouse leave', () => {
    const overlayRef = makeMockOverlayRef({ left: 0, top: 0 });
    const { result } = renderHook(() => useDrawingCursor('pen', overlayRef, 4, 20));

    act(() => {
      result.current.handleMouseMove(makeMockMouseEvent(50, 80));
    });
    act(() => {
      result.current.handleMouseLeave();
    });

    expect(result.current.cursorPosition).toBeNull();
  });

  it('returns penRadius as cursorRadius in pen mode', () => {
    const { result } = renderHook(() => useDrawingCursor('pen', makeMockOverlayRef(), 4, 20));

    expect(result.current.cursorRadius).toBe(4);
  });

  it('returns eraserRadius as cursorRadius in eraser mode', () => {
    const { result } = renderHook(() => useDrawingCursor('eraser', makeMockOverlayRef(), 4, 20));

    expect(result.current.cursorRadius).toBe(20);
  });

  it('returns penRadius as cursorRadius in idle mode', () => {
    const { result } = renderHook(() => useDrawingCursor('idle', makeMockOverlayRef(), 4, 20));

    expect(result.current.cursorRadius).toBe(4);
  });

  it('does not update cursor position when overlayRef.current is null', () => {
    const nullRef = { current: null };
    const { result } = renderHook(() => useDrawingCursor('pen', nullRef, 4, 20));

    act(() => {
      result.current.handleMouseMove(makeMockMouseEvent(50, 80));
    });

    expect(result.current.cursorPosition).toBeNull();
  });
});
