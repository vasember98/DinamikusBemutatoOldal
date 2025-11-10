import { writable, get } from 'svelte/store';
import type { NodeId, NodeRecord, SlotId } from './types';

export const graph = writable<Map<NodeId, NodeRecord>>(new Map());

export function getNode(id: NodeId): NodeRecord | undefined {
  return get(graph).get(id);
}

export function children(parentId: NodeId, _slot: SlotId = null): NodeRecord[] {
  const g = get(graph);
  const parent = g.get(parentId);
  if (!parent) return [];
  return parent.children
    .map((cid) => g.get(cid))
    .filter((n): n is NodeRecord => !!n);
}

export function isDescendant(nodeId: NodeId, candidateParentId: NodeId): boolean {
  const g = get(graph);
  let cur = g.get(candidateParentId);
  while (cur) {
    if (cur.parentId === nodeId) return true;
    cur = cur.parentId ? g.get(cur.parentId) : undefined;
  }
  return false;
}

export function accepts(parentId: NodeId, _slot: SlotId, childId: NodeId): boolean {
  const g = get(graph);
  const parent = g.get(parentId);
  const child = g.get(childId);
  if (!parent || !child) return false;
  if (parent.behavior !== 'zone') return false;
  // For now zones accept anything we'd reasonably place inside
  return child.behavior === 'draggable' || child.behavior === 'hybrid' || child.behavior === 'zone';
}

export function move(nodeId: NodeId, newParentId: NodeId, slot: SlotId, index?: number): void {
  graph.update((g) => {
    const node = g.get(nodeId);
    const newParent = g.get(newParentId);
    if (!node || !newParent) return g;

    if (nodeId === newParentId) return g;
    if (isDescendant(nodeId, newParentId)) return g;
    if (!accepts(newParentId, slot, nodeId)) return g;

    // remove from old parent
    if (node.parentId) {
      const oldParent = g.get(node.parentId);
      if (oldParent) {
        oldParent.children = oldParent.children.filter((id) => id !== nodeId);
        g.set(oldParent.id, { ...oldParent });
      }
    }

    // reparent
    node.parentId = newParentId;
    node.slot = slot;

    // insert into new parent
    const pos = Math.max(
      0,
      Math.min(index ?? newParent.children.length, newParent.children.length)
    );
    const next = [...newParent.children];
    // ensure no dup
    for (let i = next.length - 1; i >= 0; i--) if (next[i] === nodeId) next.splice(i, 1);
    next.splice(pos, 0, nodeId);

    g.set(node.id, { ...node });
    g.set(newParent.id, { ...newParent, children: next });
    return g;
  });
}

export function upsert(node: NodeRecord): void {
  graph.update((g) => {
    g.set(node.id, { ...node });
    return g;
  });
}

export function remove(nodeId: NodeId): void {
  graph.update((g) => {
    const node = g.get(nodeId);
    if (!node) return g;
    if (node.parentId) {
      const p = g.get(node.parentId);
      if (p) {
        p.children = p.children.filter((id) => id !== nodeId);
        g.set(p.id, { ...p });
      }
    }
    g.delete(nodeId);
    return g;
  });
}
