// types/graph.ts
import type { NodeObject, LinkObject } from "react-force-graph-3d";

// --- Supabase types ---
export interface DBNode {
  id: string;
  label: string;
  level?: number;
}

export interface DBLink {
  id: string;
  source: string;
  target: string;
  type?: string;
}

// --- Types pour l'app, compatibles ForceGraph3D ---
export type NodeType = NodeObject<{
  id: string;
  label: string;
  level?: number;
}>;

export type LinkType = LinkObject<NodeType, DBLink> & {
  id: string;
  type?: string;
};
