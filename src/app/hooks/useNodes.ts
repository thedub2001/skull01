// hooks/useNodes.ts
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useMoleculeSettings } from "./useMoleculeSettings";
import type { NodeType } from "../types/types";
import * as localDB from "../db/localDB";
import * as remoteDB from "../db/remoteDB";
import { pullRemoteToLocal } from "../db/sync";

const DEBUG_MODE = true;
const PREFIX = "[useNodes]";

function dbg(...args: unknown[]) {
  if (DEBUG_MODE) console.log(PREFIX, ...args);
}

/**
 * Hook pour gérer les nodes (multi-dataset)
 * - lit `dbMode` et `dataset` depuis useMoleculeSettings
 * - remote = supabase.fetchNodes(dataset)
 * - local = indexedDB.getAllByDataset("nodes", dataset)
 * - sync = pullRemoteToLocal(dataset) puis lecture locale
 */
export function useNodes() {
  const { dbMode, dataset } = useMoleculeSettings();
  const [nodes, setNodes] = useState<NodeType[]>([]);

  /**
   * Fetch complet des nodes pour le dataset courant.
   */
  const fetchGraphData = useCallback(async () => {
    dbg("fetchGraphData start", { dbMode, dataset });

    if (!dataset) {
      dbg("no dataset selected -> returning []");
      setNodes([]);
      return [] as NodeType[];
    }

    try {
      if (dbMode === "local") {
        const local = await localDB.getAllByDataset("nodes", dataset);
        setNodes(local as NodeType[]);
        dbg("loaded local nodes count=", (local as NodeType[]).length);
        return local as NodeType[];
      }

      if (dbMode === "remote") {
        const remote = await remoteDB.fetchNodes(dataset);
        setNodes(remote);
        dbg("loaded remote nodes count=", remote.length);
        return remote;
      }

      if (dbMode === "sync") {
        // Pull remote dataset -> local (overwrite local for that dataset)
        await pullRemoteToLocal(dataset);
        const localAfter = await localDB.getAllByDataset("nodes", dataset);
        setNodes(localAfter as NodeType[]);
        dbg("sync: loaded nodes count=", (localAfter as NodeType[]).length);
        return localAfter as NodeType[];
      }

      return [] as NodeType[];
    } catch (err) {
      console.error(PREFIX, "fetchGraphData ERROR:", err);
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
        if (dbMode === "local") {
          await localDB.addItem("nodes", newNode);
        } else if (dbMode === "remote") {
          await remoteDB.addNode(newNode);
        } else {
          // sync: write remote then local
          await remoteDB.addNode(newNode);
          await localDB.addItem("nodes", newNode);
        }

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
        if (dbMode === "local") {
          await localDB.deleteItem("nodes", id);
        } else if (dbMode === "remote") {
          await remoteDB.deleteNode(id);
        } else {
          await remoteDB.deleteNode(id);
          await localDB.deleteItem("nodes", id);
        }

        setNodes((prev) => prev.filter((n) => n.id !== id));
        return true;
      } catch (err) {
        console.error(PREFIX, "deleteNode ERROR:", err);
        return false;
      }
    },
    [dbMode]
  );

  return { nodes, fetchGraphData, addNode, deleteNode };
}
