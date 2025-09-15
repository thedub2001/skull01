// hooks/useLinks.ts
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useMoleculeSettings } from "./useMoleculeSettings";
import type { LinkType } from "../types/types";
import * as localDB from "../db/localDB";
import * as remoteDB from "../db/remoteDB";
import { pullRemoteToLocal } from "../db/sync";

const DEBUG_MODE = true;
const PREFIX = "[useLinks]";

function dbg(...args: unknown[]) {
  if (DEBUG_MODE) console.log(PREFIX, ...args);
}

/**
 * Hook pour gérer les links (multi-dataset)
 */
export function useLinks() {
  const { dbMode, dataset } = useMoleculeSettings();
  const [links, setLinks] = useState<LinkType[]>([]);

  /**
   * Fetch complet des links pour le dataset courant.
   */
  const fetchLinks = useCallback(async () => {
    dbg("fetchLinks start", { dbMode, dataset });

    if (!dataset) {
      dbg("no dataset selected -> returning []");
      setLinks([]);
      return [] as LinkType[];
    }

    try {
      if (dbMode === "local") {
        const local = await localDB.getAllByDataset("links", dataset);
        setLinks(local as LinkType[]);
        dbg("loaded local links count=", (local as LinkType[]).length);
        return local as LinkType[];
      }

      if (dbMode === "remote") {
        const remote = await remoteDB.fetchLinks(dataset);
        setLinks(remote);
        dbg("loaded remote links count=", remote.length);
        return remote;
      }

      if (dbMode === "sync") {
        await pullRemoteToLocal(dataset);
        const localAfter = await localDB.getAllByDataset("links", dataset);
        setLinks(localAfter as LinkType[]);
        dbg("sync: loaded links count=", (localAfter as LinkType[]).length);
        return localAfter as LinkType[];
      }

      return [] as LinkType[];
    } catch (err) {
      console.error(PREFIX, "fetchLinks ERROR:", err);
      setLinks([]);
      return [] as LinkType[];
    }
  }, [dbMode, dataset]);

  /**
   * Add link (includes dataset)
   */
  const addLink = useCallback(
    async (source: string, target: string, type?: string | null): Promise<LinkType> => {
      if (!dataset) throw new Error("No dataset selected");
      const newLink: LinkType = {
        id: uuidv4(),
        source,
        target,
        dataset,
        type,
      } as LinkType;

      dbg("addLink", { dbMode, newLink });

      try {
        if (dbMode === "local") {
          await localDB.addItem("links", newLink);
        } else if (dbMode === "remote") {
          await remoteDB.addLink(newLink);
        } else {
          await remoteDB.addLink(newLink);
          await localDB.addItem("links", newLink);
        }

        setLinks((prev) => [...prev, newLink]);
        return newLink;
      } catch (err) {
        console.error(PREFIX, "addLink ERROR:", err);
        throw err;
      }
    },
    [dbMode, dataset]
  );

  /**
   * Delete link
   */
  const deleteLink = useCallback(
    async (id: string): Promise<boolean> => {
      dbg("deleteLink", { dbMode, id });

      try {
        if (dbMode === "local") {
          await localDB.deleteItem("links", id);
        } else if (dbMode === "remote") {
          await remoteDB.deleteLink(id);
        } else {
          await remoteDB.deleteLink(id);
          await localDB.deleteItem("links", id);
        }

        setLinks((prev) => prev.filter((l) => l.id !== id));
        return true;
      } catch (err) {
        console.error(PREFIX, "deleteLink ERROR:", err);
        return false;
      }
    },
    [dbMode]
  );

  return { links, fetchLinks, addLink, deleteLink };
}
