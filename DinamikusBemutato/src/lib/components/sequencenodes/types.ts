export type ParamType = 'data' | 'array' | 'unary' | 'binary';

export interface ParamRow {
  id: string;
  name: string;   // parameter label/name
  type: ParamType;
  _empty?: boolean; // internal flag for the trailing empty row
}
