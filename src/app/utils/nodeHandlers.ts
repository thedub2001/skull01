// utils/nodeHandlers.ts
import { NotEqualStencilFunc } from "three";
import type { NodeType, LinkType, VisualLinkType } from "../types/types";

/**
 * Supprime un nœud et ses liens associés (classiques + visualLinks)
 */
export async function deleteNodeHandler(
  nodeId: string,
  nodes: NodeType[],
  links: LinkType[],
  deleteNode: (nodeId: string) => Promise<boolean>,
  deleteLink: (linkId: string) => Promise<boolean>,
  visualLinks: VisualLinkType[],
  removeVisualLink: (id: string) => Promise<boolean>
) {
  console.log("[graph][deleteNodeHandler] deleting node:", nodeId);

  // Supprimer les liens classiques
  const relatedLinks = links.filter(l => {
    const sourceId = typeof l.source === "string" ? l.source : l.source.id;
    const targetId = typeof l.target === "string" ? l.target : l.target.id;
    return sourceId === nodeId || targetId === nodeId;
  });

  for (const l of relatedLinks) {
    await deleteLink(l.id);
    console.log("[graph][deleteNodeHandler] deleted link:", l.id);
  }

  // Supprimer les visualLinks
  const relatedVisualLinks = visualLinks.filter(v => v.source === nodeId || v.target === nodeId);
  for (const vl of relatedVisualLinks) {
    await removeVisualLink(vl.id);
    console.log("[graph][deleteNodeHandler] deleted visualLink:", vl.id);
  }

  // Supprimer le nœud lui-même
  await deleteNode(nodeId);
  console.log("[graph][deleteNodeHandler] deleted node:", nodeId);
}

/**
 * Supprime un nœud et **tous ses descendants** (liens parent-child)
 */
export async function deleteNodeRecursive(
  nodeId: string,
  nodes: NodeType[],
  links: LinkType[],
  deleteNode: (nodeId: string) => Promise<boolean>,
  deleteLink: (linkId: string) => Promise<boolean>,
  visualLinks: VisualLinkType[],
  removeVisualLink: (id: string) => Promise<boolean>
) {
  // Trouver les enfants directs via liens parent-child
  const childLinks = links.filter(l => {
    const sourceId = typeof l.source === "string" ? l.source : l.source.id;
    const targetId = typeof l.target === "string" ? l.target : l.target.id;
    return sourceId === nodeId && l.type === "parent-child";
  });

  // Supprimer récursivement tous les enfants
  for (const cl of childLinks) {
    const childId = typeof cl.target === "string" ? cl.target : cl.target.id;
    await deleteNodeRecursive(childId, nodes, links, deleteNode, deleteLink, visualLinks, removeVisualLink);
  }

  // Une fois tous les enfants supprimés, supprimer ce nœud
  await deleteNodeHandler(nodeId, nodes, links, deleteNode, deleteLink, visualLinks, removeVisualLink);
}

/**
 * Handler pour créer un enfant et le lier au parent
 */
export async function addChildNodeHandler(
  parentId: string,
  nodes: NodeType[],
  addNode: (label: string, type?: string | null, level?: number) => Promise<NodeType | null>,
  addLink: (source: string, target: string, type?: string) => Promise<LinkType | null>
) {
  const parentNode = nodes.find(n => n.id === parentId);
  if (!parentNode) {
    console.error("[graph][addChildNodeHandler] parent node not found:", parentId);
    return;
  }

  console.log("[graph][addChildNodeHandler] parent label:", parentNode.label);

  const childLevel = (parentNode.level ?? 0) + 1;

  const newNode = await addNode(`Enfant de ${parentNode.label}`,null ,childLevel);
  if (!newNode) return;

  await addLink(parentId, newNode.id, "parent-child");
}
