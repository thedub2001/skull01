export interface NodeType {
  id: string;
  label: string;
  type: string;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  level?: number;
}

export interface LinkType {
  id: string;
  source: NodeType | string;
  target: NodeType | string;
  type: string;
}

export const test = 'ok'
  