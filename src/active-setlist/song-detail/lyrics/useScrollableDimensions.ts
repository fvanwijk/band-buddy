import { type RefObject, useEffect, useRef, useState } from 'react';

interface UseScrollableDimensionsReturn {
  containerRef: RefObject<HTMLDivElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
  dimensions: { width: number; height: number };
}

export function useScrollableDimensions(): UseScrollableDimensionsReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ height: 0, width: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          height: containerRef.current.scrollHeight,
          width: containerRef.current.scrollWidth,
        });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return {
    containerRef,
    dimensions,
    overlayRef,
  };
}
