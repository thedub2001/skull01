// hooks/useNodes.ts
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useSettings } from "../context/SettingsContext";
import type { NodeType } from "../types/graph";
import * as localDB from "../db/localDB";
import * as remoteDB from "../db/remoteDB";

export function useNodes() {
  const { dbMode } = useSettings();
  const [nodes, setNodes] = useState<NodeType[]>([]);

  /** Fetch */
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
      const remote = await remoteDB.fetchNodes();
      setNodes(remote);
      // maj local avec la vérité remote
      await localDB.importDB({ nodes: remote, links: [], visual_links: [] });
      return remote;
    }

    return [];
  }, [dbMode]);

  /** Add */
  const addNode = useCallback(async (label: string, level?: number) => {
    const newNode: NodeType = { id: uuidv4(), label, level };
    console.log("[useNodes][addNode] mode=", dbMode, newNode);

    if (dbMode === "local") {
      await localDB.addItem("nodes", newNode);
      setNodes(prev => [...prev, newNode]);
    }

    if (dbMode === "remote") {
      await remoteDB.addNode(newNode);
      setNodes(prev => [...prev, newNode]);
    }

    if (dbMode === "sync") {
      await remoteDB.addNode(newNode);
      await localDB.addItem("nodes", newNode);
      setNodes(prev => [...prev, newNode]);
    }

    return newNode;
  }, [dbMode]);

  /** Delete */
  const deleteNode = useCallback(async (id: string) => {
    console.log("[useNodes][deleteNode] mode=", dbMode, id);

    if (dbMode === "local") {
      await localDB.deleteItem("nodes", id);
    }
    if (dbMode === "remote") {
      await remoteDB.deleteNode(id);
    }
    if (dbMode === "sync") {
      await remoteDB.deleteNode(id);
      await localDB.deleteItem("nodes", id);
    }

    setNodes(prev => prev.filter(n => n.id !== id));
    return true;
  }, [dbMode]);

  return { nodes, fetchGraphData, addNode, deleteNode };
}
