import React, { useEffect, useRef, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import InfoPanel from "./components/InfoPanel";
import useLabelSprite from "./components/LabelSprite";
import useCameraTracker from "./hooks/useCameraTracker";
import { useNodes } from "./hooks/useNodes";
import { useLinks } from "./hooks/useLinks";
import { useGraphSelection } from "./hooks/useGraphSelection";
import { useVisualLinks } from "./hooks/useVisualLinks";
import { useVisualLinksRenderer } from "./hooks/useVisualLinksRenderer"
import { useGraphDataSync } from "./hooks/useGraphDataSync";
import { useGraphInitialFetch } from "./hooks/useGraphInitialFetch"
import { useNodeLabelGenerator } from "./hooks/useNodeLabelGenerator";
import { addChildNodeHandler, deleteNodeHandler } from "./utils/nodeHandlers";

import type { ForceGraphMethods } from "react-force-graph-3d";
import type { NodeType, LinkType } from "./types/graph";

const levelToColor = (level: number): string => {
  const baseHue = 60;
  const hueStep = 47;
  const hue = (baseHue + level * hueStep) % 360;
  const saturation = 80;
  const lightness = level % 2 === 0 ? 45 : 65;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

function App() {
  const fgRef = useRef<ForceGraphMethods<NodeType, LinkType> | null>(null);

  // --- Hooks ---
  const { nodes, fetchGraphData, addNode, deleteNode } = useNodes();
  const { links, fetchLinks, addLink, deleteLink } = useLinks();
  const { visualLinks, fetchVisualLinks } = useVisualLinks();
  const {
    selectedNodes,
    selectedLinks,
    setSelectedNodes,
    setSelectedLinks,
    getLinkId,
    onNodeClick,
    onLinkClick,
  } = useGraphSelection();

  const graphData = useGraphDataSync(nodes, links);

  const cameraPos = useCameraTracker(fgRef);

  // --- Helpers ---
  const generateTextLabel = useNodeLabelGenerator();
  const nodeThreeObject = useLabelSprite({ cameraPos, generateTextLabel });

  // --- Fetch initial data (externalized) ---
  useGraphInitialFetch(fetchGraphData, fetchLinks, fetchVisualLinks);

  // --- Visual links rendering (externalized) ---
  useVisualLinksRenderer({
    fgRef,
    graphData,
    visualLinks,
    selectedLinks,
    setSelectedLinks,
    getLinkId,
  });

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
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
        nodeColor={(node) =>
          selectedNodes.has((node as NodeType).id)
            ? "orange"
            : levelToColor((node as NodeType).level ?? 0)
        }
        onNodeClick={onNodeClick}
        linkColor={(link) =>
          selectedLinks.has(getLinkId(link as LinkType)) ? "orange" : "#aaa"
        }
        onLinkClick={onLinkClick}
      />

      <InfoPanel
        selectedNodes={nodes.filter((n) => selectedNodes.has(n.id))}
        selectedLinks={links.filter((l) => selectedLinks.has(getLinkId(l)))}
        nodes={nodes}
        links={links}
        onClose={() => {
          setSelectedNodes(new Set());
          setSelectedLinks(new Set());
          console.log("[graph][infoPanel] Closed");
        }}
        onCreateChildNode={async (parentId) => {
          await addChildNodeHandler(parentId, nodes, addNode, addLink);
        }}
        onDeleteNode={async (nodeId) => {
          await deleteNodeHandler(nodeId, nodes, links, deleteNode, deleteLink);
        }}
      />
    </div>
  );
}

export default App;
