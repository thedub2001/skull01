// hooks/useGraphDataSync.ts
import { useMemo } from "react";
import type { NodeType, LinkType } from "../types/types";

/**
 * Retourne un objet stable { nodes, links } pour ForceGraph3D.
 */
export function useGraphDataSync(nodes: NodeType[], links: LinkType[]) {
  return useMemo(() => ({ nodes, links }), [nodes, links]);
}
