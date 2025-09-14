// app/db/remoteDB.ts
import { supabase } from "../lib/supabase";
import type { NodeType, LinkType } from "../types/graph";
import type { VisualLinkType } from "../types/VisualLinkType";
import { v4 as uuidv4 } from "uuid";
import molecule from '@dtinsight/molecule';



export type DatasetRow = {
  id: string;
  name: string;
  created_at: string;
  user: string;
  metadata: Record<string, unknown>;
};

/**
 * Récupère un dataset unique depuis Supabase
 */
export async function fetchDataset(datasetId: string): Promise<DatasetRow | null> {
  const { data, error } = await supabase
    .from("datasets")
    .select("*")
    .eq("id", datasetId)
    .single();

  if (error) {
    console.error("[datasetUtils] fetchDataset error:", error);
    return null;
  }

  console.log("[datasetUtils] fetchDataset:", data);
  return data as DatasetRow;
}

/**
 * Liste tous les datasets stockés à distance sur Supabase
 */
export async function listRemoteDatasets(): Promise<DatasetRow[]> {
  const { data, error } = await supabase.from("datasets").select("*");
  if (error) {
    console.error("[datasetUtils] listRemoteDatasets error:", error);
    return [];
  }
  console.log("[datasetUtils] listRemoteDatasets:", data);
  return (data ?? []) as DatasetRow[];
}

/**
 * Crée un nouveau dataset distant sur Supabase
 * et y ajoute automatiquement un nœud initial
 */
export async function createRemoteDataset(name: string, user: string): Promise<DatasetRow | null> {

    const settings = molecule.settings.getSettings(); // todo : gérer correctement le paramètre "propriétaire"
    console.log("[datasetUtils] user id setting:", (settings as any).user); // idem

  const newDataset: Omit<DatasetRow, "created_at"> = {
    id: uuidv4(),
    name,
    user : (settings as any).user,
    metadata: {},
  };

  // --- Créer le dataset sur Supabase ---
  const { data, error } = await supabase.from("datasets").insert(newDataset).select().single();
  if (error) {
    console.error("[datasetUtils] createRemoteDataset error:", error);
    return null;
  }
  const createdDataset = data as DatasetRow;
  console.log("[datasetUtils] createRemoteDataset:", createdDataset);

  // --- Créer un nœud initial pour ce dataset ---
  const initialNode: NodeType = {
    id: uuidv4(),
    label: "Root Node",
    type: "root",
    level:1,
    dataset: createdDataset.id,
  };
  const { error: nodeError } = await supabase.from("nodes").insert(initialNode);
  if (nodeError) {
    console.error("[datasetUtils] createRemoteDataset: ajout nœud initial error:", nodeError);
  } else {
    console.log("[datasetUtils] createRemoteDataset: nœud initial ajouté", initialNode);
  }

  return createdDataset;
}

// ---------- Fetch Datasets ----------
export async function fetchDatasets(): Promise<DatasetRow[]> {
  const { data, error } = await supabase.from("datasets").select("*");
  if (error) {
    console.error("[remoteDB] fetchDatasets error:", error);
    return [];
  }
  console.log("[remoteDB] fetchDatasets:", data);
  return (data ?? []) as DatasetRow[];
}

// ---------- Fetch ----------
export async function fetchNodes(datasetId: string): Promise<NodeType[]> {
  const { data, error } = await supabase
    .from("nodes")
    .select("*")
    .eq("dataset", datasetId);
  if (error) {
    console.error("[remoteDB] fetchNodes error:", error);
    return [];
  }
  return (data ?? []) as NodeType[];
}

export async function fetchLinks(datasetId: string): Promise<LinkType[]> {
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("dataset", datasetId);
  if (error) {
    console.error("[remoteDB] fetchLinks error:", error);
    return [];
  }
  return (data ?? []) as LinkType[];
}

export async function fetchVisualLinks(
  datasetId: string,
  filterType?: string
): Promise<VisualLinkType[]> {
  let query = supabase.from("visual_links").select("*").eq("dataset", datasetId);
  if (filterType) query = query.eq("type", filterType);

  const { data, error } = await query;
  if (error) {
    console.error("[remoteDB] fetchVisualLinks error:", error);
    return [];
  }
  return (data ?? []) as VisualLinkType[];
}

// ---------- Nodes CRUD ----------
export async function addNode(node: NodeType) {
  const { error } = await supabase.from("nodes").insert(node);
  if (error) console.error("[remoteDB] addNode error:", error, node);
  else console.log("[remoteDB] addNode:", node);
}

export async function updateNode(node: NodeType) {
  const { error } = await supabase.from("nodes").update(node).eq("id", node.id);
  if (error) console.error("[remoteDB] updateNode error:", error, node);
  else console.log("[remoteDB] updateNode:", node);
}

export async function deleteNode(id: string) {
  const { error } = await supabase.from("nodes").delete().eq("id", id);
  if (error) console.error("[remoteDB] deleteNode error:", error, id);
  else console.log("[remoteDB] deleteNode:", id);
}

// ---------- Links CRUD ----------
export async function addLink(link: LinkType) {
  const { error } = await supabase.from("links").insert(link);
  if (error) console.error("[remoteDB] addLink error:", error, link);
  else console.log("[remoteDB] addLink:", link);
}

export async function updateLink(link: LinkType) {
  const { error } = await supabase.from("links").update(link).eq("id", link.id);
  if (error) console.error("[remoteDB] updateLink error:", error, link);
  else console.log("[remoteDB] updateLink:", link);
}

export async function deleteLink(id: string) {
  const { error } = await supabase.from("links").delete().eq("id", id);
  if (error) console.error("[remoteDB] deleteLink error:", error, id);
  else console.log("[remoteDB] deleteLink:", id);
}

// ---------- VisualLinks CRUD ----------
export async function addVisualLink(vl: VisualLinkType) {
  const { error } = await supabase.from("visual_links").insert(vl);
  if (error) console.error("[remoteDB] addVisualLink error:", error, vl);
  else console.log("[remoteDB] addVisualLink:", vl);
}

export async function updateVisualLink(vl: VisualLinkType) {
  const { error } = await supabase.from("visual_links").update(vl).eq("id", vl.id);
  if (error) console.error("[remoteDB] updateVisualLink error:", error, vl);
  else console.log("[remoteDB] updateVisualLink:", vl);
}

export async function deleteVisualLink(id: string) {
  const { error } = await supabase.from("visual_links").delete().eq("id", id);
  if (error) console.error("[remoteDB] deleteVisualLink error:", error, id);
  else console.log("[remoteDB] deleteVisualLink:", id);
}
