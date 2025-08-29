// hooks/useNodes.ts
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../lib/supabase";
import type { NodeType } from "../types/graph";
import * as localDB from "../db/localDB";

/**
 * Hook de gestion des nœuds
 */
export function useNodes() {
  const [nodes, setNodes] = useState<NodeType[]>([]);

  /** Fetch nodes depuis localDB, puis tente Supabase pour sync distant */
  const fetchGraphData = useCallback(async (): Promise<NodeType[]> => {
    console.log("[useNodes][fetchGraphData] start");

    // 1️⃣ Charger local
    const localNodes = await localDB.getAll("nodes");
    if (localNodes.length) {
      setNodes(localNodes);
      console.log("[useNodes][fetchGraphData] local loaded", localNodes);
    }

    // 2️⃣ Essayer distant
    try {
      const { data, error } = await supabase.from("nodes").select("*");
      if (error || !data) {
        console.warn("[useNodes][fetchGraphData] Supabase offline?", error?.message);
        return localNodes;
      }

      setNodes(data);
      console.log("[useNodes][fetchGraphData] remote loaded", data);

      // 3️⃣ Sync local avec distant
      await localDB.importDB({ nodes: data, links: [], visual_links: [] });

      return data;
    } catch (err) {
      console.warn("[useNodes][fetchGraphData] fetch error", err);
      return localNodes;
    }
  }, []);

  /** Ajout local + tentative sync distant */
  const addNode = useCallback(
    async (label: string,type?: string | null, level?: number): Promise<NodeType> => {
      const newNode: NodeType = { id: uuidv4(), label, level };

      // Local immédiat
      await localDB.addItem("nodes", newNode);
      setNodes(prev => [...prev, newNode]);
      console.log("[useNodes][addNode] local added", newNode);

      // Essayer distant
      try {
        const { error } = await supabase
          .from("nodes")
          .insert([{ id: newNode.id, label: newNode.label, level: newNode.level }]);
        if (error) console.warn("[useNodes][addNode] Supabase offline", error.message);
      } catch (err) {
        console.warn("[useNodes][addNode] remote insert error", err);
      }

      return newNode;
    },
    []
  );

  /** Suppression local + tentative sync distant */
  const deleteNode = useCallback(async (id: string): Promise<boolean> => {
    await localDB.deleteItem("nodes", id);
    setNodes(prev => prev.filter(n => n.id !== id));
    console.log("[useNodes][deleteNode] local deleted id=", id);

    try {
      const { error } = await supabase.from("nodes").delete().eq("id", id);
      if (error) console.warn("[useNodes][deleteNode] Supabase offline", error.message);
    } catch (err) {
      console.warn("[useNodes][deleteNode] remote delete error", err);
    }

    return true;
  }, []);

  return { nodes, fetchGraphData, addNode, deleteNode };
}
