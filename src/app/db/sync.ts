// db/sync.ts
import * as local from "./localDB";
import * as remote from "./remoteDB";
import type { NodeType, LinkType } from "../types/graph";
import type { VisualLinkType } from "../types/VisualLinkType";

/**
 * Push complet : on supprime tout sur le remote (pour un dataset) et on envoie le local
 */
export async function pushLocalToRemote(datasetId: string) {
  console.log(`[sync] push local → remote (dataset=${datasetId})`);

  const data = await local.exportDB(datasetId);

  // --- Supprimer tout sur le remote pour ce dataset ---
  const [remoteNodes, remoteLinks, remoteVisualLinks] = await Promise.all([
    remote.fetchNodes(datasetId),
    remote.fetchLinks(datasetId),
    remote.fetchVisualLinks(datasetId),
  ]);

  await Promise.all([
    ...remoteNodes.map((n) => remote.deleteNode(n.id)),
    ...remoteLinks.map((l) => remote.deleteLink(l.id)),
    ...remoteVisualLinks.map((vl) => remote.deleteVisualLink(vl.id)),
  ]);

  // --- Ajouter le local sur le remote ---
  await Promise.all([
    ...data.nodes.map((n: NodeType) => remote.addNode({ ...n, dataset: datasetId })),
    ...data.links.map((l: LinkType) => remote.addLink({ ...l, dataset: datasetId })),
    ...data.visual_links.map((vl: VisualLinkType) => remote.addVisualLink({ ...vl, dataset: datasetId })),
  ]);

  console.log(`[sync] push terminé (dataset=${datasetId})`);
}

export async function pullRemoteToLocal(datasetId: string) {
  console.log(`[sync] pull remote → local (dataset=${datasetId})`);

  // --- Supprimer tout en local pour ce dataset ---
  const [localNodes, localLinks, localVisualLinks] = await Promise.all([
    local.getAllByDataset("nodes", datasetId),
    local.getAllByDataset("links", datasetId),
    local.getAllByDataset("visual_links", datasetId),
  ]);

  await Promise.all([
    ...localNodes.map((n) => local.deleteItem("nodes", n.id)),
    ...localLinks.map((l) => local.deleteItem("links", l.id)),
    ...localVisualLinks.map((vl) => local.deleteItem("visual_links", vl.id)),
  ]);

  local.deleteItem("datasets", datasetId)
  console.log("[sync] dataset local effacé avec nodes, links et visual_links");


  // --- Récupérer le remote ---
  const [nodes, links, visual_links, dataset] = await Promise.all([
    remote.fetchNodes(datasetId),
    remote.fetchLinks(datasetId),
    remote.fetchVisualLinks(datasetId),
    remote.fetchDataset(datasetId), // <--- nouveau
  ]);

  // --- Importer le dataset en local ---
  if (dataset) {
    await local.addItem("datasets", dataset);
    console.log("[sync] dataset créé en local:", dataset);
  }

  // --- Importer les contenus ---
  await local.importDB({ nodes, links, visual_links }, datasetId);

  console.log(`[sync] pull terminé (dataset=${datasetId})`);
}

/**
 * Init Realtime Sync
 */
export function initRealtimeSync(datasetId: string) {
  console.log(`[sync] init realtime sync (dataset=${datasetId})`);
  // TODO : implémenter la souscription Supabase realtime si nécessaire
}
