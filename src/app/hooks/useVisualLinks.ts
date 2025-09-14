// hooks/useVisualLinks.ts
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { VisualLinkType } from "../types/VisualLinkType";
import { useMoleculeSettings } from "./useMoleculeSettings";
import * as localDB from "../db/localDB";
import * as remoteDB from "../db/remoteDB";
import { pullRemoteToLocal } from "../db/sync";

const DEBUG_MODE = true;
const PREFIX = "[useVisualLinks]";

function dbg(...args: unknown[]) {
  if (DEBUG_MODE) console.log(PREFIX, ...args);
}

/**
 * Hook pour gérer les visual links (multi-dataset)
 */
export function useVisualLinks() {
  const { dbMode, dataset } = useMoleculeSettings();
  const [visualLinks, setVisualLinks] = useState<VisualLinkType[]>([]);

  /**
   * Fetch des visual links (optionnellement filtré par type)
   */
  const fetchVisualLinks = useCallback(
    async (filterType?: string) => {
      dbg("fetchVisualLinks start", { dbMode, dataset, filterType });

      if (!dataset) {
        dbg("no dataset selected -> returning []");
        setVisualLinks([]);
        return [] as VisualLinkType[];
      }

      try {
        if (dbMode === "local") {
          const local = await localDB.getAllByDataset("visual_links", dataset);
          const filtered = filterType ? (local as VisualLinkType[]).filter((v) => v.type === filterType) : (local as VisualLinkType[]);
          setVisualLinks(filtered);
          dbg("loaded local visualLinks count=", filtered.length);
          return filtered;
        }

        if (dbMode === "remote") {
          const remote = await remoteDB.fetchVisualLinks(dataset, filterType);
          setVisualLinks(remote);
          dbg("loaded remote visualLinks count=", remote.length);
          return remote;
        }

        if (dbMode === "sync") {
          await pullRemoteToLocal(dataset);
          const localAfter = await localDB.getAllByDataset("visual_links", dataset);
          const filtered = filterType ? (localAfter as VisualLinkType[]).filter((v) => v.type === filterType) : (localAfter as VisualLinkType[]);
          setVisualLinks(filtered);
          dbg("sync: loaded visualLinks count=", filtered.length);
          return filtered;
        }

        return [] as VisualLinkType[];
      } catch (err) {
        console.error(PREFIX, "fetchVisualLinks ERROR:", err);
        setVisualLinks([]);
        return [] as VisualLinkType[];
      }
    },
    [dbMode, dataset]
  );

  /**
   * Add visual link (attach dataset)
   */
  const addVisualLink = useCallback(
    async (
      source: string,
      target: string,
      type: string | null,
      metadata?: Record<string, unknown>,
      created_at?: string
    ): Promise<VisualLinkType> => {
      if (!dataset) throw new Error("No dataset selected");

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
        if (dbMode === "local") {
          await localDB.addItem("visual_links", newVL);
        } else if (dbMode === "remote") {
          await remoteDB.addVisualLink(newVL);
        } else {
          await remoteDB.addVisualLink(newVL);
          await localDB.addItem("visual_links", newVL);
        }

        setVisualLinks((prev) => [...prev, newVL]);
        return newVL;
      } catch (err) {
        console.error(PREFIX, "addVisualLink ERROR:", err);
        throw err;
      }
    },
    [dbMode, dataset]
  );

  /**
   * Delete visual link
   */
  const removeVisualLink = useCallback(
    async (id: string): Promise<boolean> => {
      dbg("removeVisualLink", { dbMode, id });

      try {
        if (dbMode === "local") {
          await localDB.deleteItem("visual_links", id);
        } else if (dbMode === "remote") {
          await remoteDB.deleteVisualLink(id);
        } else {
          await remoteDB.deleteVisualLink(id);
          await localDB.deleteItem("visual_links", id);
        }

        setVisualLinks((prev) => prev.filter((vl) => vl.id !== id));
        return true;
      } catch (err) {
        console.error(PREFIX, "removeVisualLink ERROR:", err);
        return false;
      }
    },
    [dbMode]
  );

  return { visualLinks, fetchVisualLinks, addVisualLink, removeVisualLink };
}
