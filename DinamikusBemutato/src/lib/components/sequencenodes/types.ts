export type ParamType = 'data' | 'array' | 'unary' | 'binary';
export interface ParamRow {
  id: string;
  name: string;
  type: ParamType;
  _empty?: boolean;
}
