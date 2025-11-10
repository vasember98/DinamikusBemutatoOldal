// src/lib/diagram/store.ts
import { writable, derived, get } from 'svelte/store';
import type { NodeId, NodeRecord, Layout, XY } from './types';

export const ROOT: NodeId = '__ROOT__';

// normalized stores
const nodes = writable<Record<NodeId, NodeRecord>>({});
const children = writable<Record<NodeId, NodeId[]>>({ [ROOT]: [] });
const parentOf = writable<Record<NodeId, NodeId | null>>({});
const positions = writable<Record<NodeId, XY>>({}); // only for free layout

// --- selectors ---

export const node = (id: NodeId) => derived(nodes, (N) => N[id]);
export const childrenOf = (id: NodeId) =>
  derived(children, (C) => C[id] ?? []);
export const positionOf = (id: NodeId) =>
  derived(positions, (P) => P[id]);

export function getParent(id: NodeId): NodeId | null {
  return get(parentOf)[id] ?? null;
}
export function getChildren(id: NodeId): NodeId[] {
  return get(children)[id] ?? [];
}
export function getNode(id: NodeId): NodeRecord | undefined {
  return get(nodes)[id];
}
export function isDescendant(maybeAncestor: NodeId, id: NodeId): boolean {
  let p = getParent(id);
  while (p) {
    if (p === maybeAncestor) return true;
    p = get(parentOf)[p] ?? null;
  }
  return false;
}

// --- mutations ---

export function upsertNode(rec: NodeRecord) {
  nodes.update((N) => ({ ...N, [rec.id]: rec }));
  if (get(children)[rec.id] === undefined) {
    children.update((C) => ({ ...C, [rec.id]: [] }));
  }
  if ((get(parentOf)[rec.id] ?? undefined) === undefined) {
    parentOf.update((P) => ({ ...P, [rec.id]: null }));
  }
}

/** Ensure parent has child list, and place id at end (if not present) */
export function ensureChild(parent: NodeId, id: NodeId) {
  children.update((C) => {
    const list = C[parent] ?? [];
    if (!list.includes(id)) return { ...C, [parent]: [...list, id] };
    return C;
  });
  parentOf.update((P) => ({ ...P, [id]: parent }));
}

/** Reparent + ordered insert (vertical) or simple append; returns final index */
export function moveNode({
  id,
  toParent,
  toIndex,
}: { id: NodeId; toParent: NodeId; toIndex?: number }): number {
  const fromParent = getParent(id);

  if (fromParent != null) {
    children.update((C) => {
      const from = C[fromParent] ?? [];
      const nextFrom = from.filter((n) => n !== id);
      return { ...C, [fromParent]: nextFrom };
    });
  }

  let finalIndex = -1;
  children.update((C) => {
    const list = C[toParent] ?? [];
    const idx =
      toIndex == null
        ? list.length
        : Math.max(0, Math.min(toIndex, list.length));
    const next = [...list.slice(0, idx), id, ...list.slice(idx)];
    finalIndex = idx;
    return { ...C, [toParent]: next };
  });

  parentOf.update((P) => ({ ...P, [id]: toParent }));
  return finalIndex;
}

/** Set absolute position (free layout) */
export function setPosition(id: NodeId, xy: XY) {
  positions.update((P) => ({ ...P, [id]: xy }));
}

/** Convenience: get layout of a zone (defaults 'vertical') */
export function layoutOf(id: NodeId): Layout {
  return (getNode(id)?.layout ?? 'vertical') as Layout;
}

// --- initial stub bootstrap (optional demo) ---
export function _demoSeed() {
  // root zone
  upsertNode({ id: 'zone-root', kind: 'zone', behavior: 'zone', layout: 'vertical', name: 'Root' });
  ensureChild(ROOT, 'zone-root');

  // nested zone
  upsertNode({ id: 'zone-A', kind: 'zone', behavior: 'zone', layout: 'free', name: 'Area A' });
  ensureChild('zone-root', 'zone-A');
}
