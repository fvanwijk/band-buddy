import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { type CanvasPath, ReactSketchCanvas, type ReactSketchCanvasRef } from 'react-sketch-canvas';

import { DrawingCursor } from './DrawingCursor';
import { DrawingToolbar } from './DrawingToolbar';
import { useDrawingCursor } from './useDrawingCursor';
import { useScrollableDimensions } from './useScrollableDimensions';
import { useGetSongCanvasPaths, useSetSongCanvasPaths } from '../../../api/useSong';
import { cn } from '../../../utils/cn';

type DrawingOverlayProps = {
  children: ReactNode;
  songId: string;
  zoom?: number;
};

type DrawingMode = 'idle' | 'pen' | 'eraser';

const defaultColor = '#ef4444';
const PEN_RADIUS = 4;
const ERASER_RADIUS = 10;

export function DrawingOverlay({ children, songId, zoom = 1 }: DrawingOverlayProps) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [mode, setMode] = useState<DrawingMode>('idle');
  const [selectedColor, setSelectedColor] = useState(defaultColor);

  const storedCanvasPaths = useGetSongCanvasPaths(songId);
  const setCanvasPaths = useSetSongCanvasPaths(songId);

  const { containerRef, overlayRef, dimensions } = useScrollableDimensions();
  const { cursorPosition, cursorRadius, handleMouseLeave, handleMouseMove } = useDrawingCursor(
    mode,
    overlayRef,
    PEN_RADIUS,
    ERASER_RADIUS,
    zoom,
  );

  // Initially load stored canvas paths when songId changes (not while we are drawing)
  useEffect(() => {
    if (storedCanvasPaths.length > 0) {
      canvasRef.current?.clearCanvas();
      canvasRef.current?.loadPaths(storedCanvasPaths);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId]);

  // Save immediately while drawing
  const handlePathsChange = useCallback(
    (paths: CanvasPath[]) => {
      setCanvasPaths(paths);
    },
    [setCanvasPaths],
  );

  const handleModeChange = (newMode: DrawingMode) => {
    setMode(newMode);
    if (newMode === 'eraser') {
      canvasRef.current?.eraseMode(true);
    } else {
      canvasRef.current?.eraseMode(false);
    }
  };

  const handleClear = () => {
    canvasRef.current?.clearCanvas();
    setCanvasPaths([]);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setMode('pen');
    canvasRef.current?.eraseMode(false);
  };

  return (
    <section className="relative flex flex-1 flex-col min-h-0">
      <DrawingToolbar
        mode={mode}
        onClear={handleClear}
        onColorSelect={handleColorSelect}
        onModeChange={handleModeChange}
        selectedColor={selectedColor}
      />

      <div
        className="flex flex-1 flex-col rounded-2xl border border-slate-800 bg-slate-900/60 relative overflow-auto min-h-0"
        ref={containerRef}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
        <div
          ref={overlayRef}
          className={cn('absolute inset-0', mode === 'idle' && 'pointer-events-none')}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            // For debugging
            //cursor: mode !== 'idle' ? 'none' : 'default',
            height: `${dimensions.height}px`,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            width: `${dimensions.width}px`,
          }}
        >
          <div className="w-full h-full">
            <ReactSketchCanvas
              ref={canvasRef}
              canvasColor="transparent"
              eraserWidth={ERASER_RADIUS * 2}
              onChange={handlePathsChange}
              readOnly={mode === 'idle'}
              strokeColor={selectedColor}
              strokeWidth={PEN_RADIUS}
              style={{ border: 'none' }}
            />
          </div>
          {cursorPosition && mode !== 'idle' && (
            <DrawingCursor
              color={selectedColor}
              mode={mode}
              position={cursorPosition}
              radius={cursorRadius}
            />
          )}
        </div>
      </div>
    </section>
  );
}
