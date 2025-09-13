// src/app/MeshExplorerAppEditorTab.tsx
import React from "react";
import molecule from "@dtinsight/molecule";
import type { IEditorTab } from "@dtinsight/molecule/esm/model";
import { closeMeshExplorerAuxiliaryBar, meshExplorerAuxiliaryBar } from "./meshExplorerAppAuxiliaryBar";
import styled from "styled-components";
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

export const MESH_EXPLORER_APP_ID = "meshExplorerPane";

export const meshExplorerAppEditorTab: IEditorTab = {
  id: MESH_EXPLORER_APP_ID,
  name: "Mesh Explorer",
  renderPane: () => <MeshExplorerAppEditorTabView />,
};

export function exitMeshExplorerAppEditorTabView() {
  const group = molecule.editor.getState().current;
  if (group) {
    molecule.editor.closeTab(meshExplorerAppEditorTab.id!, group.id!);
  }
}

function MeshExplorerAppEditorTabView() {
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

  const fgRef = React.useRef<ForceGraphMethods<NodeType, LinkType> | null>(null);
  const graphData = useGraphDataSync(nodes, links);

  const cameraPos = useCameraTracker(fgRef);
  const generateTextLabel = useNodeLabelGenerator();
  const nodeThreeObject = useLabelSprite({ cameraPos, generateTextLabel });

  // Initial fetch
  useGraphInitialFetch(fetchGraphData, fetchLinks, fetchVisualLinks);

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
          removeVisualLink
        );
      },
    });
  }, [
    selectedNodeObjects,
    selectedLinkObjects,
    nodes,
    links,
    visualLinks,
  ]);

  // Resize observer
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
        console.log("[GraphWrapper] resize", width, height);
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
