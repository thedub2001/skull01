export type VisualLinkType = {
    id: string;
    source_id: string
    target_id: string
    type: string | null;
    metadata: Record<string, any> | null;
    created_at: string;
  };