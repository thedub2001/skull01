// app.tsx
import React from "react";
import SettingsPanel from "./components/SettingsPanel";
import InfoPanel from "./components/InfoPanel";
import GraphWrapper from "./components/GraphWrapper";

import { useNodes } from "./hooks/useNodes";
import { useLinks } from "./hooks/useLinks";
import { useGraphSelection } from "./hooks/useGraphSelection";
import { useVisualLinks } from "./hooks/useVisualLinks";
import { useGraphDataSync } from "./hooks/useGraphDataSync";
import { useGraphInitialFetch } from "./hooks/useGraphInitialFetch";
import useCameraTracker from "./hooks/useCameraTracker";
import { useNodeLabelGenerator } from "./hooks/useNodeLabelGenerator";
import { addChildNodeHandler, deleteNodeRecursive } from "./utils/nodeHandlers";
import useLabelSprite from "./components/LabelSprite";

import type { ForceGraphMethods } from "react-force-graph-3d";
import type { NodeType, LinkType } from "./types/graph";

function App() {
  const fgRef = React.useRef<ForceGraphMethods<NodeType, LinkType> | null>(null);

  // --- Hooks de données ---
  const { nodes, fetchGraphData, addNode, deleteNode } = useNodes();
  const { links, fetchLinks, addLink, deleteLink } = useLinks();
  const { visualLinks, fetchVisualLinks, addVisualLink, removeVisualLink } = useVisualLinks();
  const {
    selectedNodes,
    selectedLinks,
    selectedNodeObjects,
    selectedLinkObjects,
    setSelectedNodes,
    setSelectedLinks,
    getLinkId,
    onNodeClick,
    onLinkClick,
  } = useGraphSelection(nodes, links);

  const graphData = useGraphDataSync(nodes, links);

  const cameraPos = useCameraTracker(fgRef);
  const generateTextLabel = useNodeLabelGenerator();
  const nodeThreeObject = useLabelSprite({ cameraPos, generateTextLabel });

  useGraphInitialFetch(fetchGraphData, fetchLinks, fetchVisualLinks);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <SettingsPanel />

      <GraphWrapper
        fgRef={fgRef}
        graphData={graphData}
        selectedNodes={selectedNodes}
        selectedLinks={selectedLinks}
        setSelectedLinks={setSelectedLinks}
        getLinkId={getLinkId}
        nodeThreeObject={nodeThreeObject}
        onNodeClick={onNodeClick}
        onLinkClick={onLinkClick}
        visualLinks={visualLinks}
      />

      <InfoPanel
        selectedNodes={selectedNodeObjects}
        selectedLinks={selectedLinkObjects}
        nodes={nodes}
        links={links}
        onClose={() => {
          setSelectedNodes(new Set());
          setSelectedLinks(new Set());
        }}
        onCreateChildNode={async (parentId) => {
          await addChildNodeHandler(parentId, nodes, addNode, addLink);
        }}
        onDeleteNode={async (nodeId) => {
          await deleteNodeRecursive(
            nodeId,
            nodes,
            links,
            deleteNode,
            deleteLink,
            visualLinks,
            removeVisualLink
          );
        }}
      />
    </div>
  );
}

export default App;
