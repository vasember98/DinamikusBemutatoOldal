// src/lib/dnd/DragManager.ts
import { writable, get } from 'svelte/store';

export type NodeId = string;
export type Point = { x: number; y: number };
export type Rect = { left: number; top: number; width: number; height: number };

const toRect = (r: DOMRect): Rect => ({
  left: r.left,
  top: r.top,
  width: r.width,
  height: r.height
});

export interface DragState {
  sourceId: NodeId;
  sourceLabel?: string;
  pointer: Point;
  startRect: DOMRect;
  offset: Point;
  overId?: NodeId;
  overLabel?: string;
  overRect?: DOMRect;
}

type DroppableReg = {
  id: NodeId;
  el: HTMLElement;
  getRect: () => DOMRect;
  enabled: boolean;
  label?: string;
  accepts?: (d: DragState) => boolean;
};

const droppables = new Map<NodeId, DroppableReg>();

export const drag = writable<DragState | null>(null);

export function registerDroppable(args: {
  id: NodeId;
  el: HTMLElement;
  getRect: () => DOMRect;
  enabled?: boolean;
  label?: string;
  accepts?: (d: DragState) => boolean;
}) {
  const reg: DroppableReg = {
    id: args.id,
    el: args.el,
    getRect: args.getRect,
    label: args.label,
    accepts: args.accepts,
    enabled: args.enabled ?? true
  };
  droppables.set(args.id, reg);
  return () => droppables.delete(args.id);
}

export function getDroppableLabel(id?: string) {
  if (!id) return undefined;
  return droppables.get(id)?.label ?? id;
}

function pickOver(pointer: Point, state?: DragState) {
  const s = state ?? get(drag);
  let overId: string | undefined;
  let overRect: DOMRect | undefined;
  let overLabel: string | undefined;
  let smallestArea = Infinity;

  droppables.forEach((d) => {
    if (!d.enabled) return;
    const rect = d.getRect();
    const inside =
      pointer.x >= rect.left &&
      pointer.x <= rect.left + rect.width &&
      pointer.y >= rect.top &&
      pointer.y <= rect.top + rect.height;
    if (!inside) return;

    if (d.accepts && s && !d.accepts(s)) return;

    const area = rect.width * rect.height;
    if (area < smallestArea) {
      smallestArea = area;
      overId = d.id;
      overRect = rect;
      overLabel = d.label ?? d.id;
    }
  });

  return { overId, overRect, overLabel };
}

export function startDrag(
  sourceId: NodeId,
  startRect: DOMRect,
  pointer: Point,
  sourceLabel?: string
) {
  const offset = { x: pointer.x - startRect.left, y: pointer.y - startRect.top };
  // Provisional state used for accepts during initial hit test
  const provisional: DragState = {
    sourceId,
    sourceLabel,
    pointer,
    startRect,
    offset
  };
  const { overId, overRect, overLabel } = pickOver(pointer, provisional);
  drag.set({ ...provisional, overId, overRect, overLabel });
}

let raf = 0;
export function moveDrag(pointer: Point) {
  const cur = get(drag);
  if (!cur) return;

  if (raf) cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    const { overId, overRect, overLabel } = pickOver(pointer, { ...cur, pointer });
    if (
      cur.pointer.x === pointer.x &&
      cur.pointer.y === pointer.y &&
      cur.overId === overId &&
      (!!cur.overRect === !!overRect)
    ) {
      return;
    }
    drag.set({ ...cur, pointer, overId, overRect, overLabel });
  });
}

export function endDrag() {
  const cur = get(drag);
  drag.set(null);
  if (cur?.overId && cur.overId !== cur.sourceId) {
    const target = droppables.get(cur.overId);
    target?.el?.dispatchEvent(
      new CustomEvent('drop', {
        bubbles: true,
        detail: {
          sourceId: cur.sourceId,
          targetId: cur.overId,
          sourceLabel: cur.sourceLabel,
          targetLabel: cur.overLabel,
          pointer: cur.pointer
        }
      })
    );
  }
}

export function cancelDrag() {
  drag.set(null);
}
