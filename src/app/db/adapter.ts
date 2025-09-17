import * as local from "./localDB";
import * as remote from "./remoteDB";
import type { NodeType, LinkType, VisualLinkType, DbMode, DatasetType } from "../types/types";
import { pullRemoteToLocal } from "./sync";

function log(method: string, mode: DbMode, extra?: unknown) {
  console.log(`[db][adapter] ${method} mode=${mode}`, extra ?? "");
}

// ---------------- Reads ----------------
export async function fetchDatasets(mode: DbMode): Promise<DatasetType[]> {
  log("fetchDatasets", mode);
  if (mode === "remote") return remote.fetchDatasets();
  if (mode === "local") return local.getAll("datasets");
  if (mode === "sync") {
    const remoteDs = await remote.fetchDatasets();
    for (const ds of remoteDs) await local.addItem("datasets", ds);
    return local.getAll("datasets");
  }
  return [];
}

export async function fetchGraphData(
  mode: DbMode,
  datasetId: string
): Promise<{ nodes: NodeType[]; links: LinkType[] }> {
  log("fetchGraphData", mode, { datasetId });
  if (mode === "remote") {
    const [nodes, links] = await Promise.all([
      remote.fetchNodes(datasetId),
      remote.fetchLinks(datasetId),
    ]);
    return { nodes, links };
  }
  const [nodes, links] = await Promise.all([
    local.getAllByDataset("nodes", datasetId),
    local.getAllByDataset("links", datasetId),
  ]);
  return { nodes, links };
}

export async function fetchVisualLinks(
  mode: DbMode,
  datasetId: string,
  filterType?: string
): Promise<VisualLinkType[]> {
  log("fetchVisualLinks", mode, { datasetId, filterType });
  if (mode === "remote") {
    return remote.fetchVisualLinks(datasetId, filterType);
  }
  if (mode === "local") {
    const all = await local.getAllByDataset("visual_links", datasetId);
    return filterType ? all.filter((v) => v.type === filterType) : all;
  }
  if (mode === "sync") {
    // Pull remote -> local (overwrite local for this dataset)
    await pullRemoteToLocal(datasetId);
    const all = await local.getAllByDataset("visual_links", datasetId);
    return filterType ? all.filter((v) => v.type === filterType) : all;
  }
  return [];
}

export async function fetchNodes(
  mode: DbMode,
  datasetId: string
): Promise<NodeType[]> {
  log("fetchNodes", mode, { datasetId });
  if (mode === "remote") {
    return remote.fetchNodes(datasetId);
  }
  if (mode === "local") {
    return local.getAllByDataset("nodes", datasetId);
  }
  if (mode === "sync") {
    // Pull remote -> local (overwrite local for this dataset)
    await pullRemoteToLocal(datasetId);
    return local.getAllByDataset("nodes", datasetId);
  }
  return [];
}

export async function fetchLinks(
  mode: DbMode,
  datasetId: string
): Promise<LinkType[]> {
  log("fetchLinks", mode, { datasetId });
  if (mode === "remote") {
    return remote.fetchLinks(datasetId);
  }
  if (mode === "local") {
    return local.getAllByDataset("links", datasetId);
  }
  if (mode === "sync") {
    // Pull remote -> local (overwrite local for this dataset)
    await pullRemoteToLocal(datasetId);
    return local.getAllByDataset("links", datasetId);
  }
  return [];
}

// ---------------- Writes (Nodes) ----------------
export async function addNode(mode: DbMode, node: NodeType) {
  log("addNode", mode, node);
  if (mode === "local") return local.addItem("nodes", node);
  if (mode === "remote") return remote.addNode(node);
  await local.addItem("nodes", node);
  await remote.addNode(node);
}

export async function updateNode(mode: DbMode, node: NodeType) {
  log("updateNode", mode, node);
  if (mode === "local") return local.addItem("nodes", node); // put = upsert
  if (mode === "remote") return remote.updateNode(node);
  await local.addItem("nodes", node);
  await remote.updateNode(node);
}

export async function deleteNode(mode: DbMode, id: string) {
  log("deleteNode", mode, id);
  if (mode === "local") return local.deleteItem("nodes", id);
  if (mode === "remote") return remote.deleteNode(id);
  await local.deleteItem("nodes", id);
  await remote.deleteNode(id);
}

// ---------------- Writes (Links) ----------------
export async function addLink(mode: DbMode, link: LinkType) {
  log("addLink", mode, link);
  if (mode === "local") return local.addItem("links", link);
  if (mode === "remote") return remote.addLink(link);
  await local.addItem("links", link);
  await remote.addLink(link);
}

export async function updateLink(mode: DbMode, link: LinkType) {
  log("updateLink", mode, link);
  if (mode === "local") return local.addItem("links", link);
  if (mode === "remote") return remote.updateLink(link);
  await local.addItem("links", link);
  await remote.updateLink(link);
}

export async function deleteLink(mode: DbMode, id: string) {
  log("deleteLink", mode, id);
  if (mode === "local") return local.deleteItem("links", id);
  if (mode === "remote") return remote.deleteLink(id);
  await local.deleteItem("links", id);
  await remote.deleteLink(id);
}

// ---------------- Writes (VisualLinks) ----------------
export async function addVisualLink(mode: DbMode, vl: VisualLinkType) {
  log("addVisualLink", mode, vl);
  if (mode === "local") return local.addItem("visual_links", vl);
  if (mode === "remote") return remote.addVisualLink(vl);
  await local.addItem("visual_links", vl);
  await remote.addVisualLink(vl);
}

export async function updateVisualLink(mode: DbMode, vl: VisualLinkType) {
  log("updateVisualLink", mode, vl);
  if (mode === "local") return local.addItem("visual_links", vl);
  if (mode === "remote") return remote.updateVisualLink(vl);
  await local.addItem("visual_links", vl);
  await remote.updateVisualLink(vl);
}

export async function deleteVisualLink(mode: DbMode, id: string) {
  log("deleteVisualLink", mode, id);
  if (mode === "local") return local.deleteItem("visual_links", id);
  if (mode === "remote") return remote.deleteVisualLink(id);
  await local.deleteItem("visual_links", id);
  await remote.deleteVisualLink(id);
}