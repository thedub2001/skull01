// hooks/useVisualLinks.ts
import { useState, useCallback } from "react";
import type { VisualLinkType } from '../types/VisualLinkType';
import { useMoleculeSettings } from "./useMoleculeSettings";
import * as localDB from "../db/localDB";
import * as remoteDB from "../db/remoteDB";
import { v4 as uuidv4 } from "uuid";
import type { LinkType } from "../types/graph";

export function useVisualLinks() {
  const { dbMode } = useMoleculeSettings();
  const [visualLinks, setVisualLinks] = useState<VisualLinkType[]>([]);

  /** Fetch */
  const fetchVisualLinks = useCallback(async () => {
    console.log("[useVisualLinks][fetchVisualLinks] mode=", dbMode);

    if (dbMode === "local") {
      const local = await localDB.getAll("visual_links");
      setVisualLinks(local);
      return local;
    }

    if (dbMode === "remote") {
      const remote = await remoteDB.fetchVisualLinks();
      setVisualLinks(remote);
      return remote;
    }

    if (dbMode === "sync") {
      const remote = await remoteDB.fetchVisualLinks();
      // full overwrite local
      await localDB.importDB({ nodes: [], links: [], visual_links: remote });
      const localAfterSync = await localDB.getAll("visual_links");
      setVisualLinks(localAfterSync);
      return localAfterSync;
    }

    return [];
  }, [dbMode]);

/** Add */
const addVisualLink = useCallback(
  async (
    source: string,
    target: string,
    type: string,
    metadata?: Record<string, unknown>,
    created_at?: string
  ) : Promise<VisualLinkType> => {
    const newVL: VisualLinkType = {
      id: uuidv4(),
      source,
      target,
      type,
      metadata: metadata ?? {},
      created_at: created_at ?? new Date().toISOString(),
    };
    console.log("[useVisualLinks][addVisualLink] mode=", dbMode, newVL);

    try {
      if (dbMode === "local") {
        await localDB.addItem("visual_links", newVL);
      } else if (dbMode === "remote") {
        await remoteDB.addVisualLink(newVL);
      } else if (dbMode === "sync") {
        await remoteDB.addVisualLink(newVL);
        await localDB.addItem("visual_links", newVL);
      }

      setVisualLinks((prev) => [...prev, newVL]);
      return newVL;
    } catch (err) {
      console.error("[useVisualLinks][addVisualLink] ERROR:", err);
      throw err;
    }
  },
  [dbMode]
);

/** Delete */
const removeVisualLink = useCallback(
  async (id: string) : Promise<boolean> => {
    console.log("[useVisualLinks][removeVisualLink] mode=", dbMode, id);

    try {
      if (dbMode === "local") {
        await localDB.deleteItem("visual_links", id);
      } else if (dbMode === "remote") {
        await remoteDB.deleteVisualLink(id);
      } else if (dbMode === "sync") {
        await remoteDB.deleteVisualLink(id);
        await localDB.deleteItem("visual_links", id);
      }

      setVisualLinks((prev) => prev.filter((vl) => vl.id !== id));
      return true;
    } catch (err) {
      console.error("[useVisualLinks][removeVisualLink] ERROR:", err);
      return false;
    }
  },
  [dbMode]
);


  return { visualLinks, fetchVisualLinks, addVisualLink, removeVisualLink };
}
