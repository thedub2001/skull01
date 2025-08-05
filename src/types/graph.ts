export type NodeType = {
  id: string;
  label?: string;
  type?: string;
  level?: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
};

  
export type LinkType = {
  id: string
  source: string
  target: string
  type?: string
}

export const test = 'ok'
  