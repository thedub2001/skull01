// hooks/useVisualLinks.ts
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { VisualLinkType } from "../types/types";
import { useMoleculeSettings } from "./useMoleculeSettings";
import { fetchVisualLinks as adapterfetchVisualLinks, addVisualLink as adapterAddVisualLink, deleteVisualLink as adapterDeleteVisualLink } from "../db/adapter";

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
        const fetchedVisualLinks = await adapterfetchVisualLinks(dbMode, dataset, filterType);
        setVisualLinks(fetchedVisualLinks);
        dbg("loaded visualLinks count=", fetchedVisualLinks.length);
        return fetchedVisualLinks;
      } catch (err) {
        console.error(PREFIX, "fetchVisualLinks ERROR:", err);
        setVisualLinks([]);
        return [] as VisualLinkType[];
      }
    },
    [dbMode, dataset]
  );

  /**
   * Ajoute un visual link attaché au dataset courant.
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
        await adapterAddVisualLink(dbMode, newVL);
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
   * Supprime un visual link.
   */
  const deleteVisualLink = useCallback(
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

  return { visualLinks, fetchVisualLinks, addVisualLink, removeVisualLink: deleteVisualLink };
}