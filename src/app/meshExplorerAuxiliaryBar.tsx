// src/app/MeshExplorerAuxiliaryBar.tsx

import molecule from "@dtinsight/molecule";
import type { IAuxiliaryData } from "@dtinsight/molecule/esm/model";
import { AuxiliaryBarService } from "@dtinsight/molecule/esm/services";

import InfoPanel from "./components/InfoPanel";
import type { NodeType, LinkType } from "./types/types";

const auxiliaryBarService = molecule.auxiliaryBar as AuxiliaryBarService;

export interface MeshExplorerAuxProps {
  selectedNodes?: NodeType[];
  selectedLinks?: LinkType[];
  nodes?: NodeType[];
  links?: LinkType[];
  onClose?: () => void;
  onCreateChildNode?: (parentId: string) => Promise<void>;
  onDeleteNode?: (nodeId: string) => Promise<void>;
}

function MeshExplorerAuxiliaryBarView({
  selectedNodes = [],
  selectedLinks = [],
  nodes = [],
  links = [],
  onClose = () => {},
  onCreateChildNode = async () => {},
  onDeleteNode = async () => {},
}: MeshExplorerAuxProps) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <header className="mo-sidebar__header">
        <div className="mo-sidebar__title">
          <h2>Mesh Explorer Tools</h2>
        </div>
      </header>

      <div className="mo-sidebar__content">
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

export function meshExplorerAuxiliaryBar(props?: MeshExplorerAuxProps) {
  const key = "MeshExplorerAuxiliaryBar";
  const tabData: IAuxiliaryData = { key, title: "Mesh Explorer Tools" };

  const state = auxiliaryBarService.getState?.();
  const exists = !!state?.data?.some((d: any) => d.key === key);

  if (!exists) {
    auxiliaryBarService.addAuxiliaryBar(tabData);
  }

  auxiliaryBarService.setChildren(<MeshExplorerAuxiliaryBarView {...(props ?? {})} />);
  auxiliaryBarService.setActive(key);
  molecule.layout.setAuxiliaryBar(false);
  auxiliaryBarService.render();
}

export function closeMeshExplorerAuxiliaryBar() {
  const key = "MeshExplorerAuxiliaryBar";
  const state = auxiliaryBarService.getState();

  const newData = state.data?.filter((d: any) => d.key !== key) ?? [];

  auxiliaryBarService.setState({
    ...state,
    data: newData,
    current: newData.length ? newData[0].key : undefined,
  });

  molecule.layout.setAuxiliaryBar(true);
}
