// db/sync.ts
import * as local from "./localDB";
import * as remote from "./remoteDB";
import type { NodeType, LinkType } from "../types/graph";
import type { VisualLink } from "../utils/addDynamicVisualLinks";

/**
 * Push complet : on supprime tout sur le remote et on envoie le local
 */
export async function pushLocalToRemote() {
  console.log("[sync] push local → remote");

  const data = await local.exportDB();

  // --- Supprimer tout sur le remote ---
  const remoteNodes = await remote.fetchNodes();
  const remoteLinks = await remote.fetchLinks();
  const remoteVisualLinks = await remote.fetchVisualLinks();

  await Promise.all([
    ...remoteNodes.map((n) => remote.deleteNode(n.id)),
    ...remoteLinks.map((l) => remote.deleteLink(l.id)),
    ...remoteVisualLinks.map((vl) => remote.deleteVisualLink(vl.id)),
  ]);

  // --- Ajouter le local sur le remote ---
  await Promise.all([
    ...data.nodes.map((n) => remote.addNode(n)),
    ...data.links.map((l) => remote.addLink(l)),
    ...data.visual_links.map((vl) => remote.addVisualLink(vl)),
  ]);

  console.log("[sync] push terminé");
}

/**
 * Pull complet : on supprime tout en local et on importe le remote
 */
export async function pullRemoteToLocal() {
  console.log("[sync] pull remote → local");

  // --- Supprimer tout en local ---
  const localNodes = await local.getAll("nodes");
  const localLinks = await local.getAll("links");
  const localVisualLinks = await local.getAll("visual_links");

  await Promise.all([
    ...localNodes.map((n) => local.deleteItem("nodes", n.id)),
    ...localLinks.map((l) => local.deleteItem("links", l.id)),
    ...localVisualLinks.map((vl) => local.deleteItem("visual_links", vl.id)),
  ]);

  // --- Récupérer le remote et importer ---
  const nodes = await remote.fetchNodes();
  const links = await remote.fetchLinks();
  const visual_links = await remote.fetchVisualLinks();

  await local.importDB({ nodes, links, visual_links });

  console.log("[sync] pull terminé");
}

/**
 * Init Realtime Sync
 */
export function initRealtimeSync() {
  console.log("[sync] init realtime sync");
  // TODO : implémenter si nécessaire
}
