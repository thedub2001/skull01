// components/GraphInfoPanel.tsx
import React from "react";
import InfoPanel from "./InfoPanel";
import type { NodeType, LinkType } from "../types/graph";

type Props = {
  nodes: NodeType[];
  links: LinkType[];
  selectedNodes: Set<string>;
  selectedLinks: Set<string>;
  getLinkId: (link: LinkType) => string;
  onClose: () => void;
  onCreateChildNode: (parentId: string) => Promise<void>;
  onDeleteNode: (nodeId: string) => Promise<void>;
};

export default function GraphInfoPanel({
  nodes,
  links,
  selectedNodes,
  selectedLinks,
  getLinkId,
  onClose,
  onCreateChildNode,
  onDeleteNode,
}: Props) {
  return (
    <InfoPanel
      selectedNodes={nodes.filter(n => selectedNodes.has(n.id))}
      selectedLinks={links.filter(l => selectedLinks.has(getLinkId(l)))}
      nodes={nodes}
      links={links}
      onClose={onClose}
      onCreateChildNode={onCreateChildNode}
      onDeleteNode={onDeleteNode}
    />
  );
}
