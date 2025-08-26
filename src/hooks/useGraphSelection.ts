import { useState } from "react";
import type { NodeType, LinkType } from "../types/graph";

export function useGraphSelection() {
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());

  const getLinkId = (link: LinkType): string =>
    `${typeof link.source === "object" ? link.source.id : link.source}|${typeof link.target === "object" ? link.target.id : link.target}`;

  const onNodeClick = (node: NodeType) => {
    const nodeId = node.id;
    setSelectedNodes(prev => {
      const newSet = new Set(prev);
      newSet.has(nodeId) ? newSet.delete(nodeId) : newSet.add(nodeId);
      console.log("[graph][selectNodes]", Array.from(newSet));
      return newSet;
    });
  };

  const onLinkClick = (link: LinkType) => {
    const id = getLinkId(link);
    setSelectedLinks(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      console.log("[graph][selectLinks]", Array.from(newSet));
      return newSet;
    });
  };

  return {
    selectedNodes,
    selectedLinks,
    setSelectedNodes,
    setSelectedLinks,
    getLinkId,
    onNodeClick,
    onLinkClick,
  };
}
