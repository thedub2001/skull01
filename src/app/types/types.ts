// types/graph.ts
import type { NodeObject, LinkObject } from "react-force-graph-3d";

// --- Supabase types ---
export interface DBNode {
  id: string;
  label: string;
  dataset: string; // identifiant du dataset
  level?: number;
}

export interface DBLink {
  id: string;
  source: string; // UUID du node source
  target: string; // UUID du node target
  dataset: string; // identifiant du dataset
  type?: string;
}

// --- Types pour l'app, compatibles ForceGraph3D ---
export type NodeType = NodeObject<{
  id: string;
  label: string;
  dataset: string;
  level?: number;
}>;

export type LinkType = LinkObject<NodeType, DBLink> & {
  id: string;
  dataset: string;
  type?: string;
};

export type VisualLinkType = {
  id: string;
  source: string; // UUID du node source
  target: string; // UUID du node target
  dataset: string; // identifiant du dataset
  type: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
};export type DbMode = "local" | "remote" | "sync";


export type DatasetType = {
  id: string;
  name: string;
  created_at: string;
  user: string;
  metadata: Record<string, unknown>;
};