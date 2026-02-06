import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { type CanvasPath, ReactSketchCanvas, type ReactSketchCanvasRef } from 'react-sketch-canvas';

import { DrawingToolbar } from './DrawingToolbar';
import { useGetSongCanvasPaths, useSetSongCanvasPaths } from '../../../api/useSong';
import { cn } from '../../../utils/cn';

type DrawingOverlayProps = {
  children: ReactNode;
  songId: string;
};

type DrawingMode = 'idle' | 'pen' | 'eraser';

const defaultColor = '#ef4444';

export function DrawingOverlay({ children, songId }: DrawingOverlayProps) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [mode, setMode] = useState<DrawingMode>('idle');
  const [selectedColor, setSelectedColor] = useState(defaultColor);

  const storedCanvasPaths = useGetSongCanvasPaths(songId);
  const setCanvasPaths = useSetSongCanvasPaths(songId);

  useEffect(() => {
    if (storedCanvasPaths.length > 0) {
      canvasRef.current?.clearCanvas();
      canvasRef.current?.loadPaths(storedCanvasPaths);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId]);

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

      <div className="flex flex-1 flex-col rounded-2xl border border-slate-800 bg-slate-900/60 relative overflow-y-auto min-h-0">
        {children}
        <div
          className={cn(
            'absolute inset-0',
            mode !== 'idle' ? 'pointer-events-auto touch-none' : 'pointer-events-none',
          )}
        >
          <ReactSketchCanvas
            ref={canvasRef}
            className="h-full w-full"
            canvasColor="transparent"
            eraserWidth={20}
            onChange={handlePathsChange}
            strokeColor={selectedColor}
            strokeWidth={4}
            style={{ border: 'none' }}
          />
        </div>
      </div>
    </section>
  );
}
