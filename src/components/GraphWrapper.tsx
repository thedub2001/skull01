// components/GraphWrapper.tsx
import React from "react";
import ForceGraph3D from "react-force-graph-3d";
import { useVisualLinksRenderer } from "../hooks/useVisualLinksRenderer";
import { useSettings } from "../context/SettingsContext"; // <-- import du context
import type { NodeType, LinkType } from "../types/graph";
import type { VisualLinkType } from "../types/VisualLinkType";
import type { ForceGraphMethods } from "react-force-graph-3d";
import { levelToColor } from "../utils/color";

interface Props {
  fgRef: React.MutableRefObject<ForceGraphMethods<NodeType, LinkType> | null>;
  graphData: { nodes: NodeType[]; links: LinkType[] };
  selectedNodes: Set<string>;
  selectedLinks: Set<string>;
  setSelectedLinks: React.Dispatch<React.SetStateAction<Set<string>>>;
  getLinkId: (link: LinkType) => string;
  nodeThreeObject: any;
  onNodeClick: (node: NodeType) => void;
  onLinkClick: (link: LinkType) => void;
  visualLinks: VisualLinkType[];
}

export default function GraphWrapper({
  fgRef,
  graphData,
  selectedNodes,
  selectedLinks,
  setSelectedLinks,
  getLinkId,
  nodeThreeObject,
  onNodeClick,
  onLinkClick,
  visualLinks,
}: Props) {
  // --- Visual links rendering ---
  useVisualLinksRenderer({
    fgRef,
    graphData,
    visualLinks,
    selectedLinks,
    setSelectedLinks,
    getLinkId,
  });

  // --- Récupération du hueStep depuis le context ---
  const { hueStep } = useSettings();
  console.log("[GraphWrapper] Current hueStep:", hueStep);

  return (
    <ForceGraph3D
      ref={fgRef}
      graphData={graphData}
      backgroundColor="#222"
      linkWidth={(link) =>
        selectedLinks.has(getLinkId(link as LinkType)) ? 6 : 2
      }
      linkOpacity={1}
      nodeThreeObject={nodeThreeObject}
      nodeThreeObjectExtend
      nodeColor={(node: NodeType) => {
        const color =
          selectedNodes.has(node.id)
            ? "orange"
            : levelToColor(node.level ?? 0, hueStep);
        console.log(
          "[GraphWrapper][nodeColor]",
          node.label,
          "level:",
          node.level,
          "color:",
          color
        );
        return color;
      }}
      onNodeClick={onNodeClick}
      linkColor={(link) =>
        selectedLinks.has(getLinkId(link as LinkType)) ? "orange" : "#aaa"
      }
      onLinkClick={onLinkClick}
    />
  );
}
