//types/VisualLinkTypes.ts
export type VisualLinkType = {
  id: string;
  source: string; // UUID du node source
  target: string; // UUID du node target
  dataset: string; // identifiant du dataset
  type: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
};
