// src/app/MeshExplorerAppEditorTab.tsx

import React, { useCallback } from "react";
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

const ActionBtn  = styled(molecule.component.Button)`
  width: 120px;
  display: inline-block;
`;

function MeshExplorerAppEditorTabView() {
    const close = useCallback(() => {
        exitMeshExplorerAppEditorTabView();
        closeMeshExplorerAuxiliaryBar();
    }, []);

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

  useGraphInitialFetch(fetchGraphData, fetchLinks, fetchVisualLinks);

   
  const openAuxiliaryBar = useCallback(() => meshExplorerAuxiliaryBar({
    selectedNodes: selectedNodeObjects,
    selectedLinks: selectedLinkObjects,
    nodes : nodes,
    links :links,
  }
  ), [
        selectedNodeObjects,
        selectedLinkObjects,
        nodes,
        links,
  ]);



  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1 }}>
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
      </div>
      <div style={{ padding: 8 }}>
        <ActionBtn onClick={openAuxiliaryBar}>Open Tools</ActionBtn>
        <ActionBtn onClick={close}>Close Tab</ActionBtn>
      </div>
    </div>
  );
}
