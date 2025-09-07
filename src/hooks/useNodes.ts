// hooks/useNodes.ts
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useMoleculeSettings } from "../hooks/useMoleculeSettings";
import type { NodeType } from "../types/graph";
import * as localDB from "../db/localDB";
import * as remoteDB from "../db/remoteDB";
import { pullRemoteToLocal } from "../db/sync";

export function useNodes() {
  const { dbMode } = useMoleculeSettings();
  const [nodes, setNodes] = useState<NodeType[]>([]);

  /** Fetch complet */
  const fetchGraphData = useCallback(async () => {
    console.log("[useNodes][fetchGraphData] mode=", dbMode);

    if (dbMode === "local") {
      const local = await localDB.getAll("nodes");
      setNodes(local);
      return local;
    }

    if (dbMode === "remote") {
      const remote = await remoteDB.fetchNodes();
      setNodes(remote);
      return remote;
    }

    if (dbMode === "sync") {
      // Full overwrite local avec le remote
      await pullRemoteToLocal();

      // Lire tout depuis local pour mettre à jour le state
      const localNodes = await localDB.getAll("nodes");
      setNodes(localNodes);
      return localNodes;
    }

    return [];
  }, [dbMode]);

  /** Add */
  const addNode = useCallback(
    async (label: string, type?: string | null, level?: number) => {
      const newNode: NodeType = { id: uuidv4(), label, type, level: level ?? 0 };
      console.log("[useNodes][addNode] mode=", dbMode, newNode);

      if (dbMode === "local") {
        await localDB.addItem("nodes", newNode);
      } else if (dbMode === "remote") {
        await remoteDB.addNode(newNode);
      } else if (dbMode === "sync") {
        await remoteDB.addNode(newNode);
        await localDB.addItem("nodes", newNode);
      }

      setNodes((prev) => [...prev, newNode]);
      return newNode;
    },
    [dbMode]
  );

  /** Delete */
  const deleteNode = useCallback(
    async (id: string) => {
      console.log("[useNodes][deleteNode] mode=", dbMode, id);

      if (dbMode === "local") {
        await localDB.deleteItem("nodes", id);
      } else if (dbMode === "remote") {
        await remoteDB.deleteNode(id);
      } else if (dbMode === "sync") {
        await remoteDB.deleteNode(id);
        await localDB.deleteItem("nodes", id);
      }

      setNodes((prev) => prev.filter((n) => n.id !== id));
      return true;
    },
    [dbMode]
  );

  return { nodes, fetchGraphData, addNode, deleteNode };
}
