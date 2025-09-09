// hooks/useVisualLinks.ts
import { useState, useCallback } from "react";
import type { VisualLinkType } from '../types/VisualLinkType';
import { useMoleculeSettings } from "./useMoleculeSettings";
import * as localDB from "../db/localDB";
import * as remoteDB from "../db/remoteDB";
import { v4 as uuidv4 } from "uuid";

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
    async (source: string, target: string, type: string, metadata?: Record<string, unknown>,created_at?: string) => {
      const newVL: VisualLinkType = {
        id: uuidv4(),
        source,
        target,
        type,
        metadata: metadata ?? {},
        created_at:"",
      };
      console.log("[useVisualLinks][addVisualLink] mode=", dbMode, newVL);

      if (dbMode === "local") {
        await localDB.addItem("visual_links", newVL);
        setVisualLinks(prev => [...prev, newVL]);
      }
      if (dbMode === "remote") {
        await remoteDB.addVisualLink(newVL);
        setVisualLinks(prev => [...prev, newVL]);
      }
      if (dbMode === "sync") {
        await remoteDB.addVisualLink(newVL);
        await localDB.addItem("visual_links", newVL);
        setVisualLinks(prev => [...prev, newVL]);
      }

      return newVL;
    },
    [dbMode]
  );

  /** Delete */
  const removeVisualLink = useCallback(async (id: string) => {
    console.log("[useVisualLinks][removeVisualLink] mode=", dbMode, id);

    if (dbMode === "local") {
      await localDB.deleteItem("visual_links", id);
    }
    if (dbMode === "remote") {
      await remoteDB.deleteVisualLink(id);
    }
    if (dbMode === "sync") {
      await remoteDB.deleteVisualLink(id);
      await localDB.deleteItem("visual_links", id);
    }

    setVisualLinks(prev => prev.filter(vl => vl.id !== id));
    return true;
  }, [dbMode]);

  return { visualLinks, fetchVisualLinks, addVisualLink, removeVisualLink };
}
