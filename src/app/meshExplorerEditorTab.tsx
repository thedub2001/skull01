// src/app/MeshExplorerEditorTab.tsx
import React from "react";
import molecule from "@dtinsight/molecule";
import type { IEditorTab } from "@dtinsight/molecule/esm/model";

import MeshExplorerEditorTabView from "./components/editor/MeshExplorerEditorTabView";

export const MESH_EXPLORER_APP_ID = "meshExplorerPane";

/**
 * Déclaration de l’onglet Mesh Explorer dans Molecule.
 */
export const meshExplorerEditorTab: IEditorTab = {
  id: MESH_EXPLORER_APP_ID,
  name: "Mesh Explorer",
  renderPane: () => <MeshExplorerEditorTabView />,
};

/**
 * Ferme l’onglet Mesh Explorer de Molecule.
 */
export function exitMeshExplorerEditorTabView() {
  const group = molecule.editor.getState().current;
  if (group) {
    molecule.editor.closeTab(meshExplorerEditorTab.id!, group.id!);
  }
}
