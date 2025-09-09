// src/db/remoteDB.ts
import { supabase } from "../lib/supabase";
import type { NodeType, LinkType } from "../types/graph";
import type { VisualLink } from "../utils/addDynamicVisualLinks";

// ---------- Fetch ----------
export async function fetchNodes(): Promise<NodeType[]> {
  const { data, error } = await supabase.from("nodes").select("*");
  if (error) {
    console.error("[db][remote] fetchNodes error:", error);
    return [];
  }
  console.log("[db][remote] fetchNodes:", data);
  return (data ?? []) as NodeType[];
}

export async function fetchLinks(): Promise<LinkType[]> {
  const { data, error } = await supabase.from("links").select("*");
  if (error) {
    console.error("[db][remote] fetchLinks error:", error);
    return [];
  }
  console.log("[db][remote] fetchLinks:", data);
  return (data ?? []) as LinkType[];
}

export async function fetchVisualLinks(filterType?: string): Promise<VisualLink[]> {
  let query = supabase.from("visual_links").select("*");
  if (filterType) query = query.eq("type", filterType);

  const { data, error } = await query;
  if (error) {
    console.error("[db][remote] fetchVisualLinks error:", error);
    return [];
  }
  const list = (data ?? []).map((row) => ({
    id: row.id,
    source: row.source,
    target
    : row.target
    ,
    type: row.type,
    metadata: row.metadata || {},
  })) as VisualLink[];

  console.log("[db][remote] fetchVisualLinks:", list);
  return list;
}

// ---------- Nodes CRUD ----------
export async function addNode(node: NodeType) {
  const { error } = await supabase.from("nodes").insert(node);
  if (error) console.error("[db][remote] addNode error:", error, node);
  else console.log("[db][remote] addNode:", node);
}

export async function updateNode(node: NodeType) {
  const { error } = await supabase.from("nodes").update(node).eq("id", node.id);
  if (error) console.error("[db][remote] updateNode error:", error, node);
  else console.log("[db][remote] updateNode:", node);
}

export async function deleteNode(id: string) {
  const { error } = await supabase.from("nodes").delete().eq("id", id);
  if (error) console.error("[db][remote] deleteNode error:", error, id);
  else console.log("[db][remote] deleteNode:", id);
}

// ---------- Links CRUD ----------
export async function addLink(link: LinkType) {
  const { error } = await supabase.from("links").insert(link);
  if (error) console.error("[db][remote] addLink error:", error, link);
  else console.log("[db][remote] addLink:", link);
}

export async function updateLink(link: LinkType) {
  const { error } = await supabase.from("links").update(link).eq("id", link.id);
  if (error) console.error("[db][remote] updateLink error:", error, link);
  else console.log("[db][remote] updateLink:", link);
}

export async function deleteLink(id: string) {
  const { error } = await supabase.from("links").delete().eq("id", id);
  if (error) console.error("[db][remote] deleteLink error:", error, id);
  else console.log("[db][remote] deleteLink:", id);
}

// ---------- VisualLinks CRUD ----------
export async function addVisualLink(vl: VisualLink) {
  const { error } = await supabase.from("visual_links").insert(vl);
  if (error) console.error("[db][remote] addVisualLink error:", error, vl);
  else console.log("[db][remote] addVisualLink:", vl);
}

export async function updateVisualLink(vl: VisualLink) {
  const { error } = await supabase.from("visual_links").update(vl).eq("id", vl.id);
  if (error) console.error("[db][remote] updateVisualLink error:", error, vl);
  else console.log("[db][remote] updateVisualLink:", vl);
}

export async function deleteVisualLink(id: string) {
  const { error } = await supabase.from("visual_links").delete().eq("id", id);
  if (error) console.error("[db][remote] deleteVisualLink error:", error, id);
  else console.log("[db][remote] deleteVisualLink:", id);
}
