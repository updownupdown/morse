import { useCallback, useRef, useState } from "react";

interface ILongPress {
  onClickLong: (e: Event) => void;
  onClickShort: () => void;
  onMouseDown: () => void;
  onMouseUp: () => void;
  shouldPreventDefault: boolean;
  delay: number;
}

export const useLongPress = ({
  onClickLong,
  onClickShort,
  onMouseDown,
  onMouseUp,
  shouldPreventDefault = true,
  delay = 300,
}: ILongPress) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<any>(null);
  const target = useRef<any>(null);

  const start = useCallback(
    (event: Event) => {
      if (shouldPreventDefault && event.target) {
        event.target.addEventListener("touchend", preventDefault, {
          passive: false,
        });
        target.current = event.target;
      }
      timeout.current = setTimeout(() => {
        onClickLong(event);
        setLongPressTriggered(true);
      }, delay);
      onMouseDown();
    },
    [onClickLong, delay, shouldPreventDefault]
  );

  const clear = useCallback(
    (event: Event, shouldTriggerClick = true) => {
      timeout.current && clearTimeout(timeout.current);
      shouldTriggerClick && !longPressTriggered && onClickShort();
      setLongPressTriggered(false);
      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener("touchend", preventDefault);
      }
      onMouseUp();
    },
    [shouldPreventDefault, onClickShort, longPressTriggered]
  );

  return {
    onMouseDown: (e: any) => start(e),
    onTouchStart: (e: any) => start(e),
    onMouseUp: (e: any) => clear(e),
    onMouseLeave: (e: any) => clear(e, false),
    onTouchEnd: (e: any) => clear(e),
  };
};

const isTouchEvent = (event: Event) => {
  return "touches" in event;
};

const preventDefault = (event: any) => {
  if (!isTouchEvent(event)) return;

  if (event.touches.length < 2 && event.preventDefault) {
    event.preventDefault();
  }
};

export default useLongPress;
