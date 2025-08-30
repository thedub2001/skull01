//types/VisualLinkTypes.ts
export type VisualLinkType = {
    id: string;
    source: string
    target: string
    type: string | null;
    metadata: Record<string, any> | null;
    created_at: string;
  };