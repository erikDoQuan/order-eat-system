import { useEffect, useRef } from 'react';

export function useEventListener(
  eventType: string,
  callback: (event: Event | MouseEvent) => void,

  element?: HTMLElement | Window | Document | null,
  options?: { capture?: boolean; once?: boolean; passive?: boolean; signal?: AbortSignal },
): void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (typeof window === 'undefined' || !element) return;

    const handler = (e: Event | MouseEvent) => callbackRef.current(e);

    element.addEventListener(eventType, handler, options);

    return () => {
      element.removeEventListener(eventType, handler, options);
    };
  }, [eventType, element]);
}
