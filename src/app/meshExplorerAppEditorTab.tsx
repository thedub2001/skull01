// src/app/MeshExplorerAppEditorTab.tsx

import React, { useCallback } from "react";
import molecule from "@dtinsight/molecule";
import type { IEditorTab } from "@dtinsight/molecule/esm/model";
import { closeMeshExplorerAuxiliaryBar, meshExplorerAuxiliaryBar } from "./meshExplorerAppAuxiliaryBar";
import styled from "styled-components";
import Graph3DApp from "./components/Graph3DApp";

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

const CreateDataBtn = styled(molecule.component.Button)`
  width: 120px;
  display: inline-block;
`;

function MeshExplorerAppEditorTabView() {
    const close = useCallback(() => {
        exitMeshExplorerAppEditorTabView();
        closeMeshExplorerAuxiliaryBar();
    }, []);

  const openAuxiliaryBar = useCallback(() => meshExplorerAuxiliaryBar(), []);

  return (
    <div>
      <Graph3DApp />
      <CreateDataBtn onClick={openAuxiliaryBar}>Auxiliary Bar</CreateDataBtn>
      <CreateDataBtn onClick={close}>Close</CreateDataBtn>
    </div>
  );
}
