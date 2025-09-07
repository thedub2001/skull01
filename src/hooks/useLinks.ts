// hooks/useLinks.ts
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useMoleculeSettings } from "../hooks/useMoleculeSettings";
import type { LinkType } from "../types/graph";
import * as localDB from "../db/localDB";
import * as remoteDB from "../db/remoteDB";
import { pullRemoteToLocal } from "../db/sync";

export function useLinks() {
  const { dbMode } = useMoleculeSettings();
  const [links, setLinks] = useState<LinkType[]>([]);

  /** Fetch complet */
  const fetchLinks = useCallback(async () => {
    console.log("[useLinks][fetchLinks] mode=", dbMode);

    if (dbMode === "local") {
      const local = await localDB.getAll("links");
      setLinks(local);
      return local;
    }

    if (dbMode === "remote") {
      const remote = await remoteDB.fetchLinks();
      setLinks(remote);
      return remote;
    }

    if (dbMode === "sync") {
      // Full overwrite local avec le remote
      await pullRemoteToLocal();

      // Lire tout depuis local pour mettre à jour le state
      const localLinks = await localDB.getAll("links");
      setLinks(localLinks);
      return localLinks;
    }

    return [];
  }, [dbMode]);

  /** Add */
  const addLink = useCallback(
    async (source: string, target: string, type?: string | null) => {
      const newLink: LinkType = { id: uuidv4(), source, target, type };
      console.log("[useLinks][addLink] mode=", dbMode, newLink);

      if (dbMode === "local") {
        await localDB.addItem("links", newLink);
      } else if (dbMode === "remote") {
        await remoteDB.addLink(newLink);
      } else if (dbMode === "sync") {
        await remoteDB.addLink(newLink);
        await localDB.addItem("links", newLink);
      }

      setLinks((prev) => [...prev, newLink]);
      return newLink;
    },
    [dbMode]
  );

  /** Delete */
  const deleteLink = useCallback(
    async (id: string) => {
      console.log("[useLinks][deleteLink] mode=", dbMode, id);

      if (dbMode === "local") {
        await localDB.deleteItem("links", id);
      } else if (dbMode === "remote") {
        await remoteDB.deleteLink(id);
      } else if (dbMode === "sync") {
        await remoteDB.deleteLink(id);
        await localDB.deleteItem("links", id);
      }

      setLinks((prev) => prev.filter((l) => l.id !== id));
      return true;
    },
    [dbMode]
  );

  return { links, fetchLinks, addLink, deleteLink };
}
