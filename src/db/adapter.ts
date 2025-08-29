// src/db/adapter.ts
import * as local from "./localDB";
import * as remote from "./remoteDB";
import type { NodeType, LinkType } from "../types/graph";
import type { VisualLink } from "../utils/addDynamicVisualLinks";

type DbMode = "local" | "remote" | "sync";

function log(method: string, mode: DbMode, extra?: unknown) {
  console.log(`[db][adapter] ${method} mode=${mode}`, extra ?? "");
}

async function ensureLocal() {
  // initLocalDB est lazy côté local.getAll/put, donc rien ici.
  return;
}

// ---------------- Reads ----------------
export async function fetchGraphData(mode: DbMode): Promise<{ nodes: NodeType[]; links: LinkType[] }> {
  log("fetchGraphData", mode);
  if (mode === "remote") {
    const [nodes, links] = await Promise.all([remote.fetchNodes(), remote.fetchLinks()]);
    return { nodes, links };
  }
  // local ou sync => on lit local
  const [nodes, links] = await Promise.all([local.getAll<NodeType>("nodes"), local.getAll<LinkType>("links")]);
  return { nodes, links };
}

export async function fetchVisualLinks(mode: DbMode, filterType?: string): Promise<VisualLink[]> {
  log("fetchVisualLinks", mode, { filterType });
  if (mode === "remote") {
    return remote.fetchVisualLinks(filterType);
  }
  const all = await local.getAll<VisualLink>("visual_links");
  return filterType ? all.filter((v) => v.type === filterType) : all;
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
export async function addVisualLink(mode: DbMode, vl: VisualLink) {
  log("addVisualLink", mode, vl);
  if (mode === "local") return local.addItem("visual_links", vl);
  if (mode === "remote") return remote.addVisualLink(vl);
  await local.addItem("visual_links", vl);
  await remote.addVisualLink(vl);
}

export async function updateVisualLink(mode: DbMode, vl: VisualLink) {
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
