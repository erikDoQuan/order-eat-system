import type { RefObject } from 'react';

import { useEventListener } from './use-event-listener';

type Handler = (event: MouseEvent) => void;

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: Handler,
  mouseEvent: 'mousedown' | 'mouseup' = 'mousedown',
): void {
  useEventListener(mouseEvent, event => {
    const el = ref.current;

    // Do nothing if clicking ref's element or descendent elements
    if (!el || el.contains(event.target as Node)) {
      return;
    }

    handler(event as MouseEvent);
  });
}
