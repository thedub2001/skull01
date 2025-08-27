// hooks/useNodes.ts
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../lib/supabase";
import type { DBNode, NodeType } from "../types/graph";

/**
 * Hook de gestion des nœuds
 */
export function useNodes() {
  const [nodes, setNodes] = useState<NodeType[]>([]);

  // Conversion DB → App (NodeType)
  const mapDBNodeToApp = useCallback((n: DBNode): NodeType => ({
    id: n.id,
    label: n.label,
    level: n.level ?? undefined,
  }), []);

  // Fetch complet des nœuds
  const fetchGraphData = useCallback(async (): Promise<NodeType[]> => {
    console.log("[useNodes][fetchGraphData] start");
    const { data, error } = await supabase.from("nodes").select("*");
    if (error) {
      console.error("[useNodes][fetchGraphData] error", error);
      return [];
    }
    const mapped = (data as DBNode[]).map(mapDBNodeToApp);
    setNodes(mapped);
    console.log("[useNodes][fetchGraphData] success", mapped);
    return mapped;
  }, [mapDBNodeToApp]);

  // Ajout d’un nœud
  const addNode = useCallback(async (label: string, type: string | null = null): Promise<NodeType | null> => {
    const newId = uuidv4();
    const { data, error } = await supabase
      .from("nodes")
      .insert([{ id: newId, label, type }])
      .select();
    if (error) {
      console.error("[useNodes][addNode] error", error);
      return null;
    }
    const node = mapDBNodeToApp(data?.[0] as DBNode);
    setNodes(prev => [...prev, node]);
    console.log("[useNodes][addNode] success", node);
    return node;
  }, [mapDBNodeToApp]);

  // Suppression d’un nœud
  const deleteNode = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("nodes").delete().eq("id", id);
    if (error) {
      console.error("[useNodes][deleteNode] error", error);
      return false;
    }
    setNodes(prev => prev.filter(n => n.id !== id));
    console.log("[useNodes][deleteNode] success", id);
    return true;
  }, []);

  return { nodes, fetchGraphData, addNode, deleteNode };
}
