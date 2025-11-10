// src/lib/diagram/types.ts
export type NodeId = string;

export type Behavior = 'zone' | 'draggable' | 'hybrid';
export type Layout = 'vertical' | 'free';

// reserved for hybrid/control nodes (future)
export type SlotId = null | 'then' | 'else' | 'body';

// --- (lightweight types for future-typed editor) ---

export type TypeRef =
  | { kind: 'any' }
  | { kind: 'number' } | { kind: 'string' } | { kind: 'boolean' } | { kind: 'date' }
  | { kind: 'array'; of: TypeRef }
  | { kind: 'record'; fields: Record<string, TypeRef> }
  | { kind: 'union'; of: TypeRef[] }
  | { kind: 'option'; of: TypeRef };

export type Arity = { kind: 'one' } | { kind: 'many'; min?: number; max?: number };

export type PortSpec = {
  id: string;
  name: string;
  mode: 'in' | 'out';
  type: TypeRef;
  arity: Arity;
};

// Keep this open-ended — we only need 'zone' now
export type NodeKind =
  | 'zone'
  | 'input'
  | 'output'
  | 'value'
  | 'op'
  | 'branch'
  | 'loop'
  | 'custom';

// Core persisted node record (normalized)
export type NodeRecord = {
  id: NodeId;
  kind: NodeKind;
  behavior: Behavior;      // 'zone' for ZoneNode
  name?: string;
  layout?: Layout;         // zones define this; others may ignore
  slot?: SlotId | null;    // for future hybrid parents
};

// Absolute coordinates for free layout
export type XY = { x: number; y: number };
