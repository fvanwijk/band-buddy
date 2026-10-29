import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

const FADE_OUT_DURATION_MS = 1500;

/**
 * Only the button that just stopped being highlighted fades out slowly;
 * all other transitions (e.g. hover) keep the default duration.
 */
export const useMidiButtonFadeOut = (highlightedId?: string | null) => {
  const [fadingOutId, setFadingOutId] = useState<string | null>(null);
  const previousHighlightedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const previousId = previousHighlightedIdRef.current;
    previousHighlightedIdRef.current = highlightedId ?? null;

    if (highlightedId || !previousId) {
      setFadingOutId(null);
      return;
    }

    setFadingOutId(previousId);
    const timeoutId = window.setTimeout(() => setFadingOutId(null), FADE_OUT_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [highlightedId]);

  return useCallback(
    (id: string): CSSProperties | undefined =>
      fadingOutId === id ? { transitionDuration: `${FADE_OUT_DURATION_MS}ms` } : undefined,
    [fadingOutId],
  );
};
