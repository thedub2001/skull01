import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from '../lib/supabase';
import type { DBLink, LinkType } from "../types/graph";

/**
 * Hook de gestion des liens (fetch, add, delete)
 */
export function useLinks() {
  const [links, setLinks] = useState<LinkType[]>([]);

  /**
   * Conversion DB → App
   */
  const mapDBLinkToApp = useCallback((l: DBLink): LinkType => {
    return {
        id: l.id,
        source: l.source, // pour 3d-force-graph, ça peut rester string
        target: l.target,
        type: l.type,
      };
  }, []);

  /**
   * Fetch complet des liens
   */
  const fetchLinks = useCallback(async () => {
    console.log("[fetchLinks][start]");

    const { data, error } = await supabase.from("links").select("*");

    if (error) {
      console.error("[fetchLinks][db][error]", error);
      return [];
    }

    console.log("[fetchLinks][db][success]", data);

    const mapped = (data as DBLink[]).map(mapDBLinkToApp);

    console.log("[fetchLinks][app][mapped]", mapped);

    setLinks(mapped);
    return mapped;
  }, [mapDBLinkToApp]);

  /**
   * Ajout d’un lien
   */
  const addLink = useCallback(
    async (source: string, target: string, type: string | null = null) => {
      const newId = uuidv4();

      console.log("[addLink][input]", { source, target, type, newId });

      const { data, error } = await supabase
        .from("links")
        .insert([{ id: newId, source, target, type }])
        .select();

      if (error) {
        console.error("[addLink][db][error]", error);
        return null;
      }

      const inserted = data?.[0] as DBLink;
      console.log("[addLink][db][success]", inserted);

      const LinkType = mapDBLinkToApp(inserted);
      console.log("[addLink][app][mapped]", LinkType);

      setLinks((prev) => [...prev, LinkType]);
      return LinkType;
    },
    [mapDBLinkToApp]
  );

  /**
   * Suppression d’un lien
   */
  const deleteLink = useCallback(
    async (id: string) => {
      console.log("[deleteLink][input]", { id });

      const { error } = await supabase.from("links").delete().eq("id", id);

      if (error) {
        console.error("[deleteLink][db][error]", error);
        return false;
      }

      console.log("[deleteLink][db][success]", id);

      setLinks((prev) => prev.filter((l) => l.id !== id));

      console.log("[deleteLink][app][updatedState]");
      return true;
    },
    []
  );

  return { links, fetchLinks, addLink, deleteLink };
}
