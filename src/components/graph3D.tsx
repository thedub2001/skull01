// components/Graph3D.tsx
import React, { useEffect } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { addDynamicVisualLinks, updateVisualLinks } from "../utils/addDynamicVisualLinks";
import type { NodeType, LinkType } from "../types/graph";
import type { VisualLinkType } from "../types/VisualLinkType";
import { useNodes } from "../hooks/useNodes";
import { useLinks } from "../hooks/useLinks";
const { nodes } = useNodes();
const { links } = useLinks();
const graphData = { nodes, links };

type Props = {
  fgRef: React.RefObject<any>;
  nodes: NodeType[];
  links: LinkType[];
  visualLinks: VisualLinkType[];
  nodeThreeObject: any;
  selectedNodes: Set<string>;
  selectedLinks: Set<string>;
  getLinkId: (link: LinkType) => string;
  onNodeClick: (node: NodeType) => void;
  onLinkClick: (link: LinkType) => void;
};

export default function Graph3D({
  fgRef,
  nodes,
  links,
  visualLinks,
  nodeThreeObject,
  selectedNodes,
  selectedLinks,
  getLinkId,
  onNodeClick,
  onLinkClick,
}: Props) {
  const levelToColor = (level: number) => {
    const baseHue = 60;
    const hueStep = 47;
    const hue = (baseHue + level * hueStep) % 360;
    const saturation = 80;
    const lightness = level % 2 === 0 ? 45 : 65;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // --- VisualLinks Rendering ---
  useEffect(() => {
    if (!fgRef.current || visualLinks.length === 0) return;

    const timer = setTimeout(() => {
      if (!fgRef.current) return;
      addDynamicVisualLinks(
        fgRef.current,
        visualLinks,
        { nodes },
        () => selectedLinks,
        (linkId: string) => {
          // Toggle sélection
          selectedLinks.has(linkId) ? selectedLinks.delete(linkId) : selectedLinks.add(linkId);
        }
      );
    }, 50);

    return () => clearTimeout(timer);
  }, [visualLinks, nodes, selectedLinks, fgRef]);

  // --- Animation pour mettre à jour les positions des visualLinks ---
  useEffect(() => {
    let frameId: number;
    const animate = () => {
      if (fgRef.current) updateVisualLinks(fgRef.current, { nodes });
      frameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frameId);
  }, [nodes, fgRef]);

  return (
    <ForceGraph3D
      ref={fgRef}
      graphData={graphData}
      backgroundColor="#222"
      linkWidth={link => selectedLinks.has(getLinkId(link)) ? 6 : 2}
      linkOpacity={1}
      nodeThreeObject={nodeThreeObject}
      nodeThreeObjectExtend
      nodeColor={node => selectedNodes.has((node as NodeType).id) ? "orange" : levelToColor((node as NodeType).level ?? 0)}
      onNodeClick={onNodeClick}
      linkColor={link => selectedLinks.has(getLinkId(link)) ? "orange" : "#aaa"}
      onLinkClick={onLinkClick}
    />
  );
}
