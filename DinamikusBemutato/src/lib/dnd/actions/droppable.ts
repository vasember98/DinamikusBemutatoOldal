import { drag, registerDroppable } from '../DragManager';
import type { DragState } from '../DragManager';
type Opts = {
  id: string;
  enabled?: boolean;
  label?: string;
  accepts?: (d: DragState) => boolean;
};
export function droppable(node: HTMLElement, opts: Opts) {
  let { id, enabled = true, label, accepts } = opts;
  let unregister = () => {};
  let lastOver = false;
  function register() {
    unregister();
    unregister = registerDroppable({
      id,
      el: node,
      getRect: () => node.getBoundingClientRect(),
      enabled,
      label: label ?? node.getAttribute('aria-label') ?? node.getAttribute('data-label') ?? undefined,
      accepts
    });
  }
  register();
  const unsub = drag.subscribe((d) => {
    const over = !!d && d.overId === id && enabled && (accepts ? accepts(d) : true);
    if (over && !lastOver) {
      lastOver = true;
      node.dispatchEvent(new CustomEvent('dragenter', { bubbles: true, detail: d }));
    } else if (!over && lastOver) {
      lastOver = false;
      node.dispatchEvent(new CustomEvent('dragleave', { bubbles: true, detail: d }));
    }
  });
  return {
    update(next: Opts) {
      const prevId = id;
      const prevEnabled = enabled;
      const prevLabel = label;
      id = next.id ?? id;
      if (Object.prototype.hasOwnProperty.call(next, 'enabled')) {
        enabled = next.enabled as boolean;
      }
      label = next.label ?? label;
      accepts = next.accepts ?? accepts;
      if (prevId !== id || prevEnabled !== enabled || prevLabel !== label) {
        register();
      }
    },
    destroy() {
      unsub();
      unregister();
    }
  };
}
