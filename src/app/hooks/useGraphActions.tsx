// hooks/useGraphActions.tsx
import React from "react";
import { addNode as adapterAddNode, addLink as adapterAddLink, deleteNode as adapterDeleteNode, deleteLink as adapterDeleteLink, addVisualLink as adapterAddVisualLink, deleteVisualLink as adapterDeleteVisualLink } from "../db/adapter";
import type { NodeType, LinkType, VisualLinkType } from "../types/types";
import { v4 as uuidv4 } from "uuid";
import type { DbMode } from "../types/types";

const DEBUG_MODE = true;
const PREFIX = "[useGraphActions]";

function dbg(...args: unknown[]) {
  if (DEBUG_MODE) console.log(PREFIX, ...args);
}

export function useGraphActions(
  dbMode: DbMode,
  dataset: string | null,
  setNodes: React.Dispatch<React.SetStateAction<NodeType[]>>,
  setLinks: React.Dispatch<React.SetStateAction<LinkType[]>>,
  setVisualLinks: React.Dispatch<React.SetStateAction<VisualLinkType[]>>
) {
  // Add node (fonction inchangée, juste externalisée)
  const addNode = React.useCallback(
    async (label: string, type?: string | null, level?: number): Promise<NodeType | null> => {
      if (!dataset) {
        console.error(PREFIX, "addNode ERROR: No dataset selected");
        return null;
      }
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
        return null;
      }
    },
    [dbMode, dataset]
  );

  // Add link (fonction inchangée)
  const addLink = React.useCallback(
    async (source: string, target: string, type?: string | null): Promise<LinkType | null> => {
      if (!dataset) {
        console.error(PREFIX, "addLink ERROR: No dataset selected");
        return null;
      }
      const newLink: LinkType = {
        id: uuidv4(),
        source,
        target,
        dataset,
        type,
      } as LinkType;

      dbg("addLink", { dbMode, newLink });

      try {
        await adapterAddLink(dbMode, newLink);
        setLinks((prev) => [...prev, newLink]);
        return newLink;
      } catch (err) {
        console.error(PREFIX, "addLink ERROR:", err);
        return null;
      }
    },
    [dbMode, dataset]
  );

  // Add visual link (fonction inchangée)
  const addVisualLink = React.useCallback(
    async (
      source: string,
      target: string,
      type: string | null,
      metadata?: Record<string, unknown>,
      created_at?: string
    ): Promise<VisualLinkType | null> => {
      if (!dataset) {
        console.error(PREFIX, "addVisualLink ERROR: No dataset selected");
        return null;
      }
      const newVL: VisualLinkType = {
        id: uuidv4(),
        source,
        target,
        dataset,
        type,
        metadata: metadata ?? {},
        created_at: created_at ?? new Date().toISOString(),
      };

      dbg("addVisualLink", { dbMode, newVL });

      try {
        await adapterAddVisualLink(dbMode, newVL);
        setVisualLinks((prev) => [...prev, newVL]);
        return newVL;
      } catch (err) {
        console.error(PREFIX, "addVisualLink ERROR:", err);
        return null;
      }
    },
    [dbMode, dataset]
  );

  // Delete node (fonction inchangée)
  const deleteNode = React.useCallback(
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

  // Delete link (fonction inchangée)
  const deleteLink = React.useCallback(
    async (id: string): Promise<boolean> => {
      dbg("deleteLink", { dbMode, id });
      try {
        await adapterDeleteLink(dbMode, id);
        setLinks((prev) => prev.filter((l) => l.id !== id));
        return true;
      } catch (err) {
        console.error(PREFIX, "deleteLink ERROR:", err);
        return false;
      }
    },
    [dbMode]
  );

  // Delete visual link (fonction inchangée)
  const deleteVisualLink = React.useCallback(
    async (id: string): Promise<boolean> => {
      dbg("deleteVisualLink", { dbMode, id });
      try {
        await adapterDeleteVisualLink(dbMode, id);
        setVisualLinks((prev) => prev.filter((vl) => vl.id !== id));
        return true;
      } catch (err) {
        console.error(PREFIX, "deleteVisualLink ERROR:", err);
        return false;
      }
    },
    [dbMode]
  );

  return {
    addNode,
    addLink,
    addVisualLink,
    deleteNode,
    deleteLink,
    deleteVisualLink,
  };
}