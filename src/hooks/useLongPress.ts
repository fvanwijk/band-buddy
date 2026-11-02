import type { MouseEvent, PointerEvent } from 'react';
import { useCallback, useEffect, useRef } from 'react';

const DEFAULT_DELAY_MS = 500;

type UseLongPressOptions = {
  delayMs?: number;
  /** A disabled long press lets the context menu of the browser through */
  isEnabled?: boolean;
  onLongPress: () => void;
};

/**
 * Calls onLongPress when a pointer is held down, or when the context menu is requested (right
 * click, keyboard). Spread the returned handlers on the element and call `consumeLongPress` in its
 * click handler to ignore the click that ends a long press.
 */
export const useLongPress = ({
  delayMs = DEFAULT_DELAY_MS,
  isEnabled = true,
  onLongPress,
}: UseLongPressOptions) => {
  const timeoutRef = useRef<number | null>(null);
  const hasFiredRef = useRef(false);
  const onLongPressRef = useRef(onLongPress);
  onLongPressRef.current = onLongPress;

  const cancel = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => cancel, [cancel]);

  const fire = useCallback(() => {
    cancel();
    hasFiredRef.current = true;
    onLongPressRef.current();
  }, [cancel]);

  const handlePointerDown = (event: PointerEvent) => {
    hasFiredRef.current = false;
    if (!isEnabled || (event.pointerType === 'mouse' && event.button !== 0)) {
      return;
    }

    cancel();
    timeoutRef.current = window.setTimeout(fire, delayMs);
  };

  const handleContextMenu = (event: MouseEvent) => {
    if (!isEnabled) {
      return;
    }

    event.preventDefault();
    fire();
  };

  /** Whether the click belongs to a long press, resets after it has been consumed */
  const consumeLongPress = () => {
    const hasFired = hasFiredRef.current;
    hasFiredRef.current = false;
    return hasFired;
  };

  return {
    consumeLongPress,
    handlers: {
      onContextMenu: handleContextMenu,
      onPointerCancel: cancel,
      onPointerDown: handlePointerDown,
      onPointerLeave: cancel,
      onPointerUp: cancel,
    },
  };
};
