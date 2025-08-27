import type { NodeType, LinkType } from "../types/graph";

/**
 * Handler pour créer un enfant et le lier au parent
 */
export async function addChildNodeHandler(
  parentId: string,
  nodes: NodeType[],
  addNode: (label: string, type?: string) => Promise<NodeType | null>,
  addLink: (source: string, target: string, type?: string) => Promise<LinkType | null>
) {
  const parentNode = nodes.find(n => n.id === parentId);
  if (!parentNode) {
    console.error("[graph][addChildNode] parent node not found:", parentId);
    return;
  }

  console.log("[graph][addChildNode] parent label:", parentNode.label);

  const newNode = await addNode(`Enfant de ${parentNode.label}`, "child");
  if (!newNode) return;

  await addLink(parentId, newNode.id, "parent-child");
}

/**
 * Handler pour supprimer un nœud et tous ses liens associés
 * to do : supprimer le lien avec le noeud
 */
export async function deleteNodeHandler(
  nodeId: string,
  nodes: NodeType[],
  links: LinkType[],
  deleteNode: (nodeId: string) => Promise<void>,
  deleteLink: (linkId: string) => Promise<void>
) {
  console.log("[graph][deleteNode]", nodeId);

  // Supprime les liens associés
  const relatedLinks = links.filter(l => l.source === nodeId || l.target === nodeId);
  for (const l of relatedLinks) {
    await deleteLink(l.id);
  }

  // Supprime le nœud
  await deleteNode(nodeId);
}
