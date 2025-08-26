import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from '../lib/supabase';
import type { DBNode, NodeType } from "../types/graph";

/**
 * Hook de gestion des nœuds (fetch, add, delete)
 */
export function useNodes() {
  const [nodes, setNodes] = useState<NodeType[]>([]);

  /**
   * Conversion DB → App
   */
  const mapDBNodeToApp = useCallback((n: DBNode): NodeType => {
    return {
      id: n.id,
      label: n.label,
      type: n.type,
      x: n.x ?? undefined,
      y: n.y ?? undefined,
      fx: n.fx ?? undefined,
      fy: n.fy ?? undefined,
      level: n.level ?? undefined,
    };
  }, []);

  /**
   * Fetch complet des nœuds
   */
  const fetchGraphData = useCallback(async () => {
    console.log("[fetchGraphData][start]");

    const { data, error } = await supabase.from("nodes").select("*");

    if (error) {
      console.error("[fetchGraphData][db][error]", error);
      return [];
    }

    console.log("[fetchGraphData][db][success]", data);

    const mapped = (data as DBNode[]).map(mapDBNodeToApp);

    console.log("[fetchGraphData][app][mapped]", mapped);

    setNodes(mapped);
    return mapped;
  }, [mapDBNodeToApp]);

  /**
   * Ajout d’un nœud
   */
  const addNode = useCallback(
    async (label: string, type: string | null = null) => {
      const newId = uuidv4();

      console.log("[addNode][input]", { label, type, newId });

      const { data, error } = await supabase
        .from("nodes")
        .insert([{ id: newId, label, type }])
        .select();

      if (error) {
        console.error("[addNode][db][error]", error);
        return null;
      }

      const inserted = data?.[0] as DBNode;
      console.log("[addNode][db][success]", inserted);

      const NodeType = mapDBNodeToApp(inserted);
      console.log("[addNode][app][mapped]", NodeType);

      setNodes((prev) => [...prev, NodeType]);
      return NodeType;
    },
    [mapDBNodeToApp]
  );

  /**
   * Suppression d’un nœud
   */
  const deleteNode = useCallback(
    async (id: string) => {
      console.log("[deleteNode][input]", { id });

      const { error } = await supabase.from("nodes").delete().eq("id", id);

      if (error) {
        console.error("[deleteNode][db][error]", error);
        return false;
      }

      console.log("[deleteNode][db][success]", id);

      setNodes((prev) => prev.filter((n) => n.id !== id));

      console.log("[deleteNode][app][updatedState]");
      return true;
    },
    []
  );

  return { nodes, fetchGraphData, addNode, deleteNode };
}
