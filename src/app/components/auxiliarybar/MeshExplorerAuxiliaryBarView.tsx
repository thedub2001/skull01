import InfoPanel from "./InfoPanel";
import type { NodeType, LinkType } from "../../types/types";

export interface MeshExplorerAuxProps {
  selectedNodes?: NodeType[];
  selectedLinks?: LinkType[];
  nodes?: NodeType[];
  links?: LinkType[];
  onClose?: () => void;
  onCreateChildNode?: (parentId: string) => Promise<void>;
  onDeleteNode?: (nodeId: string) => Promise<void>;
}

/**
 * Composant React affiché dans la Molecule Auxiliary Bar.
 */
export default function MeshExplorerAuxiliaryBarView({
  selectedNodes = [],
  selectedLinks = [],
  nodes = [],
  links = [],
  onClose = () => {},
  onCreateChildNode = async () => {},
  onDeleteNode = async () => {},
}: MeshExplorerAuxProps) {
  console.debug("[auxbar:view] render MeshExplorerAuxiliaryBarView", {
    selectedNodes,
    selectedLinks,
    nodesCount: nodes.length,
    linksCount: links.length,
  });

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
