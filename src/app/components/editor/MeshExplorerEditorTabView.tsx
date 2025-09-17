import React from "react";
import GraphWrapper from "./GraphWrapper";
import { useMoleculeSettings } from "../../hooks/useMoleculeSettings";
import { useGraphSelection } from "../../hooks/useGraphSelection";
import { useGraphDataSync } from "../../hooks/useGraphDataSync";
import useCameraTracker from "../../hooks/useCameraTracker";
import { useNodeLabelGenerator } from "../../hooks/useNodeLabelGenerator";
import { addChildNodeHandler, deleteNodeRecursive } from "../../utils/nodeHandlers";
import useLabelSprite from "./LabelSprite";
import type { ForceGraphMethods } from "react-force-graph-3d";
import type { NodeType, LinkType, VisualLinkType } from "../../types/types";
import { closeMeshExplorerAuxiliaryBar, meshExplorerAuxiliaryBar } from "../../meshExplorerAuxiliaryBar";
import { useGraphActions } from "../../hooks/useGraphActions";
import { useGraphDataFetch } from "../../hooks/useGraphDataFetch"; // ← Nouvel import

const DEBUG_MODE = true;
const PREFIX = "[MeshExplorerEditorTabView]";

function dbg(...args: unknown[]) {
  if (DEBUG_MODE) console.log(PREFIX, ...args);
}

/**
 * Composant React principal affiché dans l’onglet Mesh Explorer.
 */
export default function MeshExplorerEditorTabView() {
  const { dbMode, dataset } = useMoleculeSettings();
  const [nodes, setNodes] = React.useState<NodeType[]>([]);
  const [links, setLinks] = React.useState<LinkType[]>([]);
  const [visualLinks, setVisualLinks] = React.useState<VisualLinkType[]>([]);
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

  const fgRef = React.useRef<ForceGraphMethods<NodeType, LinkType> | null>(null);
  const graphData = useGraphDataSync(nodes, links);

  const cameraPos = useCameraTracker(fgRef);
  const generateTextLabel = useNodeLabelGenerator();
  const nodeThreeObject = useLabelSprite({ cameraPos, generateTextLabel });

  // Utilisation du hook pour les actions CRUD
  const { addNode, addLink, addVisualLink, deleteNode, deleteLink, deleteVisualLink } = useGraphActions(
    dbMode,
    dataset,
    setNodes,
    setLinks,
    setVisualLinks
  );

  // Utilisation du hook pour les fetches (ne retourne rien)
  useGraphDataFetch(dbMode, dataset, setNodes, setLinks, setVisualLinks);

  // Synchronisation avec l'AuxiliaryBar
  React.useEffect(() => {
    if (selectedNodeObjects.length === 0 && selectedLinkObjects.length === 0) {
      closeMeshExplorerAuxiliaryBar();
      return;
    }

    meshExplorerAuxiliaryBar({
      selectedNodes: selectedNodeObjects,
      selectedLinks: selectedLinkObjects,
      nodes,
      links,
      onClose: () => {
        setSelectedNodes(new Set());
        setSelectedLinks(new Set());
      },
      onCreateChildNode: async (parentId) => {
        await addChildNodeHandler(parentId, nodes, addNode, addLink);
      },
      onDeleteNode: async (nodeId) => {
        await deleteNodeRecursive(
          nodeId,
          nodes,
          links,
          deleteNode,
          deleteLink,
          visualLinks,
          deleteVisualLink
        );
      },
    });
  }, [selectedNodeObjects, selectedLinkObjects, nodes, links, visualLinks, addNode, deleteNode, addLink, deleteLink, deleteVisualLink]);

  // Resize observer
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
        console.debug("[GraphWrapper] resize", width, height);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <GraphWrapper
        fgRef={fgRef}
        width={size.width}
        height={size.height}
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
    </div>
  );
}