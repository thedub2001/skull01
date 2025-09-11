// a tester

// src/app/MeshExplorerAppAuxiliaryBar.tsx
import React from "react";
import molecule from "@dtinsight/molecule";
import type { IAuxiliaryData } from "@dtinsight/molecule/esm/model";
import { AuxiliaryBarService } from "@dtinsight/molecule/esm/services";

import InfoPanel from "./components/InfoPanel";
import type { NodeType, LinkType } from "./types/graph";

const auxiliaryBarService = molecule.auxiliaryBar as AuxiliaryBarService;

export interface MeshExplorerAuxProps {
  selectedNodes?: NodeType[]; // objets de noeud sélectionnés
  selectedLinks?: LinkType[]; // objets de lien sélectionnés
  nodes?: NodeType[]; // tous les noeuds
  links?: LinkType[]; // tous les liens
  onClose?: () => void;
  onCreateChildNode?: (parentId: string) => Promise<void>;
  onDeleteNode?: (nodeId: string) => Promise<void>;
}

/**
 * Vue rendue dans l'auxiliary bar. Elle reçoit TOUT ce dont InfoPanel a besoin
 * via des props — pas de hooks locaux qui dupliqueraient l'état.
 */
function MeshExplorerAuxiliaryBarView(props: MeshExplorerAuxProps) {
  const {
    selectedNodes = [],
    selectedLinks = [],
    nodes = [],
    links = [],
    onClose = () => {},
    onCreateChildNode = async () => {},
    onDeleteNode = async () => {},
  } = props ?? {};

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <header className="mo-sidebar__header">
        <div className="mo-sidebar__title">
          <h2>Mesh Explorer Tools</h2>
        </div>
      </header>

      <div className="mo-sidebar__content">
        <p style={{ textAlign: "center" }}>Mesh Explorer auxiliary content</p>

        <InfoPanel
          selectedNodes={selectedNodes}
          selectedLinks={selectedLinks}
          nodes={nodes}
          links={links}
          onClose={onClose}
          onCreateChildNode={onCreateChildNode}
          onDeleteNode={onDeleteNode}
        />
      </div>
    </div>
  );
}

/**
 * Ouvre (ou réactive) l'auxiliary bar et injecte la vue avec les props fournies.
 * - props est optionnel, mais pour un InfoPanel vivant il faut idéalement fournir
 *   selectedNodes/selectedLinks/nodes/links et les handlers (onCreateChildNode / onDeleteNode).
 */
export function meshExplorerAuxiliaryBar(props?: MeshExplorerAuxProps) {

    console.log("meshExplorerAuxiliaryBar props =", !!props);

  const key = "MeshExplorerAuxiliaryBar";
  const tabData: IAuxiliaryData = { key, title: "MeshExplorer Tools" };

  const state = auxiliaryBarService.getState ? auxiliaryBarService.getState() : undefined;
  const exists = !!state?.data?.some((d: any) => d.key === key);

  console.log("[auxiliary] open requested, exists =", exists, "props =", !!props);

  if (!exists) {
    auxiliaryBarService.addAuxiliaryBar(tabData);
    console.log("[auxiliary] tab added", tabData);
  } else {
    console.log("[auxiliary] tab already exists -> reusing it");
  }

  // Injecte l'arbre React qui contient l'InfoPanel avec les props courantes
  auxiliaryBarService.setChildren(<MeshExplorerAuxiliaryBarView {...(props ?? {})} />);
  console.log("[auxiliary] setChildren done");

  // Active le tab et affiche l'auxiliary bar
  auxiliaryBarService.setActive(key);
  molecule.layout.setAuxiliaryBar(false);

  // Forcer render (prudence)
  auxiliaryBarService.render();

  console.log("[auxiliary] opened", auxiliaryBarService.getState());
}

/**
 * Ferme et retire proprement le tab associé.
 */
export function closeMeshExplorerAuxiliaryBar() {
  const key = "MeshExplorerAuxiliaryBar";
  const state = auxiliaryBarService.getState();

  console.log("[auxiliary] before close", state);

  const newData = state.data?.filter((d: any) => d.key !== key) ?? [];

  auxiliaryBarService.setState({
    ...state,
    data: newData,
    current: newData.length ? newData[0].key : undefined,
  });

  // Si plus aucun tab, cacher la zone
  if (!newData.length) {
    molecule.layout.setAuxiliaryBar(true);
  }
  // auxiliaryBarService.setChildren(null); // empty auxiliary bar
  console.log("[auxiliary] closed", auxiliaryBarService.getState());
}
