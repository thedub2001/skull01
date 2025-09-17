import molecule from "@dtinsight/molecule";
import type { IAuxiliaryData } from "@dtinsight/molecule/esm/model";
import { AuxiliaryBarService } from "@dtinsight/molecule/esm/services";

import type { MeshExplorerAuxProps } from "./components/auxiliarybar/MeshExplorerAuxiliaryBarView";
import MeshExplorerAuxiliaryBarView from "./components/auxiliarybar/MeshExplorerAuxiliaryBarView";

const auxiliaryBarService = molecule.auxiliaryBar as AuxiliaryBarService;

/**
 * Crée et affiche la Molecule Auxiliary Bar pour Mesh Explorer.
 */
export function meshExplorerAuxiliaryBar(props?: MeshExplorerAuxProps) {
  const key = "MeshExplorerAuxiliaryBar";
  const tabData: IAuxiliaryData = { key, title: "Mesh Explorer Tools" };

  const state = auxiliaryBarService.getState?.();
  const exists = !!state?.data?.some((d: any) => d.key === key);

  console.debug("[auxbar] open requested", { exists, props });

  if (!exists) {
    console.debug("[auxbar] adding new tab", tabData);
    auxiliaryBarService.addAuxiliaryBar(tabData);
  }

  auxiliaryBarService.setChildren(<MeshExplorerAuxiliaryBarView {...(props ?? {})} />);
  auxiliaryBarService.setActive(key);
  molecule.layout.setAuxiliaryBar(false);
  auxiliaryBarService.render();

  console.debug("[auxbar] active tab set", { key });
}

/**
 * Ferme la Molecule Auxiliary Bar de Mesh Explorer.
 */
export function closeMeshExplorerAuxiliaryBar() {
  const key = "MeshExplorerAuxiliaryBar";
  const state = auxiliaryBarService.getState();

  console.debug("[auxbar] close requested", { current: state.current });

  const newData = state.data?.filter((d: any) => d.key !== key) ?? [];

  auxiliaryBarService.setState({
    ...state,
    data: newData,
    current: newData.length ? newData[0].key : undefined,
  });

  molecule.layout.setAuxiliaryBar(true);

  console.debug("[auxbar] closed", { remaining: newData.map((d: any) => d.key) });
}
