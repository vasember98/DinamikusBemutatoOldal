export type NodeType = 'input'|'output'|'paramsfn'|'if'|'while'|'assign';

// ---- input variable model
export type InputParamType = 'data' | 'array' | 'unary' | 'binary';

// 🎯 Input now stores a map of variables

export type ParamsFnProps = { fnName: string; params: string[] };
export type IfProps = { condition: string };
export type WhileProps = { condition: string };
export type AssignProps = { statement: string };


// Canvas events (unchanged API surface, but now typed with new InputProps)

export type CreateEvent =
  | { kind: 'create'; type: 'input';    props: InputProps;    atIndex?: number }
  | { kind: 'create'; type: 'output';   props: OutputProps;   atIndex?: number }
  | { kind: 'create'; type: 'paramsfn'; props: ParamsFnProps; atIndex?: number }
  | { kind: 'create'; type: 'if';       props: IfProps;       atIndex?: number }
  | { kind: 'create'; type: 'while';    props: WhileProps;    atIndex?: number }
  | { kind: 'create'; type: 'assign';   props: AssignProps;   atIndex?: number };

export type UpdatePropsEvent =
  | { kind: 'updateProps'; id: string; type: 'input';    props: InputProps }
  | { kind: 'updateProps'; id: string; type: 'output';   props: OutputProps }
  | { kind: 'updateProps'; id: string; type: 'paramsfn'; props: ParamsFnProps }
  | { kind: 'updateProps'; id: string; type: 'if';       props: IfProps }
  | { kind: 'updateProps'; id: string; type: 'while';    props: WhileProps }
  | { kind: 'updateProps'; id: string; type: 'assign';   props: AssignProps };

  // Node + props/types used across the canvas

export type ScalarType = 'number' | 'string' | 'boolean';
export type ValueType = ScalarType | 'array' | 'object';

export interface VarDef {
  type: ValueType;
  value?: unknown;
}

export interface InputVar extends VarDef {}

export interface InputProps {
  vars: Record<string, InputVar>;
}

export interface OutputProps {
  // mirror Input's shape, but for outputs:
  results: Record<string, VarDef>;
}

export type NodeKind =
  | 'input'
  | 'output'
  | 'paramsfn'
  | 'if'
  | 'while'
  | 'assign';

export interface NodeInstance {
  id: string;
  type: NodeKind;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any;
}

// palette -> canvas creation payload
export type NodeCreatePayload =
  | { type: 'input';  props?: InputProps }
  | { type: 'output'; props?: OutputProps }
  | { type: 'paramsfn'; props?: { fnName: string; params?: string[] } }
  | { type: 'if'; props?: { condition: string } }
  | { type: 'while'; props?: { condition: string } }
  | { type: 'assign'; props?: { statement: string } };

// canvas events
export type CanvasEvent =
  | { kind: 'create'; type: NodeKind; props?: unknown; atIndex?: number }
  | { kind: 'reorder'; nodes: NodeInstance[] }
  | { kind: 'delete'; id: string }
  | { kind: 'select'; id: string }
  | {
      kind: 'updateProps';
      id: string;
      type: NodeKind;
      props: unknown;
    };
