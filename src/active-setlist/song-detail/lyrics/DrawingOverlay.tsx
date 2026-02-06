import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { type CanvasPath, ReactSketchCanvas, type ReactSketchCanvasRef } from 'react-sketch-canvas';

import { DrawingToolbar } from './DrawingToolbar';
import { cn } from '../../../utils/cn';

type DrawingOverlayProps = {
  children: ReactNode;
  storageKey: string;
  toolbarContainer?: HTMLElement | null;
};

type DrawingMode = 'idle' | 'pen' | 'eraser';

const defaultColor = '#ef4444';

export function DrawingOverlay({ children, storageKey, toolbarContainer }: DrawingOverlayProps) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [mode, setMode] = useState<DrawingMode>('idle');
  const [selectedColor, setSelectedColor] = useState(defaultColor);

  useEffect(() => {
    const storedPaths = localStorage.getItem(storageKey);
    if (!storedPaths) {
      return;
    }

    try {
      const parsedPaths = JSON.parse(storedPaths) as CanvasPath[];
      if (parsedPaths.length) {
        canvasRef.current?.loadPaths(parsedPaths);
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const handlePathsChange = useCallback(
    (paths: CanvasPath[]) => {
      localStorage.setItem(storageKey, JSON.stringify(paths));
    },
    [storageKey],
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
    localStorage.removeItem(storageKey);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setMode('pen');
    canvasRef.current?.eraseMode(false);
  };

  return (
    <section className="relative flex flex-col">
      <DrawingToolbar
        mode={mode}
        onClear={handleClear}
        onColorSelect={handleColorSelect}
        onModeChange={handleModeChange}
        selectedColor={selectedColor}
      />

      <div className="relative">
        {children}
        <div
          className={cn(
            'absolute inset-0 z-10',
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
