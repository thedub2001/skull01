// hooks/useGraphDataSync.ts
import { useEffect, useState } from "react";
import type { NodeType, LinkType } from "../types/graph";
import isEqual from "fast-deep-equal";

/**
 * Hook pour synchroniser nodes & links avec graphData.
 * Retourne un objet { nodes, links } à passer au ForceGraph3D.
 */
export function useGraphDataSync(nodes: NodeType[], links: LinkType[]) {
  const [graphData, setGraphData] = useState<{ nodes: NodeType[]; links: LinkType[] }>({
    nodes: [],
    links: [],
  });

  useEffect(() => {
    if (isEqual(graphData.nodes, nodes) && isEqual(graphData.links, links)) return;
    setGraphData({ nodes, links });
  }, [nodes, links]);

  return graphData;
}
