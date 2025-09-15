// hooks/useVisualLinksRenderer.ts
import { useEffect } from "react";
import { addDynamicVisualLinks, updateVisualLinks } from "../utils/addDynamicVisualLinks";
import type { ForceGraphMethods } from "react-force-graph-3d";
import type { VisualLinkType } from "../types/types";
import type { NodeType, LinkType } from "../types/types";

interface Props {
  fgRef: React.MutableRefObject<ForceGraphMethods<NodeType, LinkType> | null>;
  graphData: { nodes: NodeType[]; links: LinkType[] };
  visualLinks: VisualLinkType[];
  selectedLinks: Set<string>;
  setSelectedLinks: React.Dispatch<React.SetStateAction<Set<string>>>;
  getLinkId: (link: LinkType) => string;
}

export function useVisualLinksRenderer({
  fgRef,
  graphData,
  visualLinks,
  selectedLinks,
  setSelectedLinks,
  getLinkId,
}: Props) {
  // --- Initialisation ---
  useEffect(() => {
    if (!fgRef.current) return;
    
    const timer = setTimeout(() => {
      if (!fgRef.current) return;

      addDynamicVisualLinks(
        fgRef.current,
        visualLinks,
        graphData,
        () => selectedLinks,
        (linkId) => {
          setSelectedLinks(prev => {
            const newSet = new Set(prev);
            newSet.has(linkId) ? newSet.delete(linkId) : newSet.add(linkId);
            console.log("[graph][selectVisualLink]", Array.from(newSet));
            return newSet;
          });
        }
      );
    }, 50);

    return () => clearTimeout(timer);
  }, [visualLinks, fgRef, graphData, selectedLinks, setSelectedLinks]);

  // --- Animation continue ---
  useEffect(() => {
    let frameId: number;

    const animate = () => {
      if (fgRef.current) updateVisualLinks(fgRef.current, graphData);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(frameId);
  }, [graphData, fgRef]);
}
