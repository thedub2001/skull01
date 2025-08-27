import { useEffect, RefObject } from "react";
import type { ForceGraphMethods, NodeObject, LinkObject } from "react-force-graph-3d";
import type { NodeType, LinkType } from "../types/graph";
import type { VisualLinkType } from "../types/VisualLinkType";
import { addDynamicVisualLinks, updateVisualLinks } from "../utils/addDynamicVisualLinks";

/**
 * Hook pour rendre et mettre à jour les visualLinks
 */
export function useVisualLinkRenderer(
  fgRef: RefObject<ForceGraphMethods<NodeObject<NodeType>, LinkObject<NodeType, LinkType>> | null>,
  nodes: NodeType[],
  visualLinks: VisualLinkType[],
  selectedLinks: Set<string>,
  setSelectedLinks: React.Dispatch<React.SetStateAction<Set<string>>>
) {
  // Création / mise à jour initiale des visualLinks
  useEffect(() => {
    if (!fgRef.current || visualLinks.length === 0) return;

    const tid = setTimeout(() => {
      if (!fgRef.current) return;

      console.log("[visualLinks][render] count:", visualLinks.length);

      addDynamicVisualLinks(
        fgRef.current,
        visualLinks,
        { nodes },
        () => selectedLinks,
        linkId => {
          setSelectedLinks(prev => {
            const next = new Set(prev);
            next.has(linkId) ? next.delete(linkId) : next.add(linkId);
            console.log("[visualLinks][toggleSelect]", linkId, "=>", Array.from(next));
            return next;
          });
        }
      );
    }, 50);

    return () => clearTimeout(tid);
  }, [fgRef, visualLinks, setSelectedLinks, selectedLinks, nodes]);

  // Animation continue pour mettre à jour les positions des visualLinks
  useEffect(() => {
    let frameId: number;

    const animate = () => {
      if (fgRef.current) {
        updateVisualLinks(fgRef.current, { nodes });
      }
      frameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frameId);
  }, [fgRef, nodes]);
}
