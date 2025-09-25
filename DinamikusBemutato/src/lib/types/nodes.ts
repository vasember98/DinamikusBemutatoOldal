export type NodeType = 'input'|'output'|'paramsfn'|'if'|'while'|'assign';


export type InputProps = { name: string; value?: unknown };
export type OutputProps = { expr: string };
export type ParamsFnProps = { fnName: string; params: string[] };
export type IfProps = { condition: string };
export type WhileProps = { condition: string };
export type AssignProps = { statement: string };


export type NodeInstance =
| { id: string; type: 'input'; props: InputProps }
| { id: string; type: 'output'; props: OutputProps }
| { id: string; type: 'paramsfn'; props: ParamsFnProps }
| { id: string; type: 'if'; props: IfProps }
| { id: string; type: 'while'; props: WhileProps }
| { id: string; type: 'assign'; props: AssignProps };

export type NodeCreatePayload =
  | { type: 'input';    props: InputProps }
  | { type: 'output';   props: OutputProps }
  | { type: 'paramsfn'; props: ParamsFnProps }
  | { type: 'if';       props: IfProps }
  | { type: 'while';    props: WhileProps }
  | { type: 'assign';   props: AssignProps };

export type CanvasEvent =
  | { kind: 'select'; id: string }
  | { kind: 'delete'; id: string }
  | { kind: 'reorder'; nodes: NodeInstance[] }
  | UpdatePropsEvent;

export type UpdatePropsEvent =
  | { kind: 'updateProps'; id: string; type: 'input';    props: InputProps }
  | { kind: 'updateProps'; id: string; type: 'output';   props: OutputProps }
  | { kind: 'updateProps'; id: string; type: 'paramsfn'; props: ParamsFnProps }
  | { kind: 'updateProps'; id: string; type: 'if';       props: IfProps }
  | { kind: 'updateProps'; id: string; type: 'while';    props: WhileProps }
  | { kind: 'updateProps'; id: string; type: 'assign';   props: AssignProps };

