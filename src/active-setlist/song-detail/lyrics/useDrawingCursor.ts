import { type RefObject, useState } from 'react';

type DrawingMode = 'idle' | 'pen' | 'eraser';

export function useDrawingCursor(
  mode: DrawingMode,
  overlayRef: RefObject<HTMLElement | null>,
  penRadius: number,
  eraserRadius: number,
) {
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (mode !== 'idle' && overlayRef.current) {
      const rect = overlayRef.current.getBoundingClientRect();
      setCursorPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseLeave = () => {
    setCursorPosition(null);
  };

  const cursorRadius = mode === 'eraser' ? eraserRadius : penRadius;

  return {
    cursorPosition,
    cursorRadius,
    handleMouseLeave,
    handleMouseMove,
  };
}
