// hooks/useLinks.ts
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useMoleculeSettings } from "./useMoleculeSettings";
import type { LinkType } from "../types/types";
import { fetchLinks as adapterFetchLinks, addLink as adapterAddLink, deleteLink as adapterDeleteLink } from "../db/adapter";

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
      const fetchedLinks = await adapterFetchLinks(dbMode, dataset);
      setLinks(fetchedLinks);
      dbg("loaded links count=", fetchedLinks.length);
      return fetchedLinks;
    } catch (err) {
      console.error(PREFIX, "fetchLinks ERROR:", err);
      setLinks([]);
      return [] as LinkType[];
    }
  }, [dbMode, dataset]);

  /**
   * Ajoute un link attaché au dataset courant.
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
        await adapterAddLink(dbMode, newLink);
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
   * Supprime un link.
   */
  const deleteLink = useCallback(
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

  return { links, fetchLinks, addLink, deleteLink };
}