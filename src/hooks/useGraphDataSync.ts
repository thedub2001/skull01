import { useEffect, useState } from "react";
import type { NodeType, LinkType } from "../types/graph";

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
    setGraphData(prev => {
      // Evite de setter si rien n’a changé (comparaison par référence)
      if (prev.nodes === nodes && prev.links === links) return prev;
      return { nodes, links };
    });
  }, [nodes, links]);

  return graphData;
}
