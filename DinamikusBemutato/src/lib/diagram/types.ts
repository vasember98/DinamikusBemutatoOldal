export type NodeId = string;
export type Behavior = 'zone' | 'draggable' | 'hybrid';
export type Layout = 'vertical' | 'free';
export type SlotId = null | 'then' | 'else' | 'body';
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
export type NodeKind =
  | 'input' | 'const'
  | 'unary' | 'binary' | 'nary'
  | 'if' | 'while' | 'lambda'
  | 'output'
  | 'zone';
export type NodeRecord = {
  id: NodeId;
  kind: NodeKind;
  behavior: Behavior;
  parentId: NodeId | null;
  slot: SlotId;
  children: NodeId[];
  layout?: Layout;
  ports: { in: PortSpec[]; out: PortSpec[] };
  meta?: Record<string, unknown>;
};
