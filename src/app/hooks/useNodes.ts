// hooks/useNodes.ts
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useMoleculeSettings } from "./useMoleculeSettings";
import type { NodeType } from "../types/types";
import { fetchNodes, addNode as adapterAddNode, deleteNode as adapterDeleteNode } from "../db/adapter";

const DEBUG_MODE = true;
const PREFIX = "[useNodes]";

function dbg(...args: unknown[]) {
  if (DEBUG_MODE) console.log(PREFIX, ...args);
}

/**
 * Hook pour gérer les nodes (multi-dataset)
 * - lit `dbMode` et `dataset` depuis useMoleculeSettings
 * - Délègue les opérations DB à adapter.ts
 */
export function useNodes() {
  const { dbMode, dataset } = useMoleculeSettings();
  const [nodes, setNodes] = useState<NodeType[]>([]);

  /**
   * Fetch complet des nodes pour le dataset courant.
   */
  const fetchNodesHook = useCallback(async () => {
    dbg("fetchNodes start", { dbMode, dataset });

    if (!dataset) {
      dbg("no dataset selected -> returning []");
      setNodes([]);
      return [] as NodeType[];
    }

    try {
      const fetchedNodes = await fetchNodes(dbMode, dataset);
      setNodes(fetchedNodes);
      dbg("loaded nodes count=", fetchedNodes.length);
      return fetchedNodes;
    } catch (err) {
      console.error(PREFIX, "fetchNodes ERROR:", err);
      setNodes([]);
      return [] as NodeType[];
    }
  }, [dbMode, dataset]);

  /**
   * Ajoute un node attaché au dataset courant.
   */
  const addNode = useCallback(
    async (label: string, type?: string | null, level?: number): Promise<NodeType> => {
      if (!dataset) throw new Error("No dataset selected");
      const newNode: NodeType = {
        id: uuidv4(),
        label,
        dataset,
        level: level ?? 0,
      } as NodeType;

      dbg("addNode", { dbMode, newNode });

      try {
        await adapterAddNode(dbMode, newNode);
        setNodes((prev) => [...prev, newNode]);
        return newNode;
      } catch (err) {
        console.error(PREFIX, "addNode ERROR:", err);
        throw err;
      }
    },
    [dbMode, dataset]
  );

  /**
   * Supprime un node (suppression remote/local suivant dbMode)
   */
  const deleteNode = useCallback(
    async (id: string): Promise<boolean> => {
      dbg("deleteNode", { dbMode, id });
      try {
        await adapterDeleteNode(dbMode, id);
        setNodes((prev) => prev.filter((n) => n.id !== id));
        return true;
      } catch (err) {
        console.error(PREFIX, "deleteNode ERROR:", err);
        return false;
      }
    },
    [dbMode]
  );

  return { nodes, fetchNodes: fetchNodesHook, addNode, deleteNode };
}