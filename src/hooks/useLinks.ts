// hooks/useLinks.ts
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../lib/supabase";
import type { DBLink, LinkType } from "../types/graph";

/**
 * Hook de gestion des liens
 */
export function useLinks() {
  const [links, setLinks] = useState<LinkType[]>([]);

  // Conversion DB → App
  const mapDBLinkToApp = useCallback((l: DBLink): LinkType => ({
    id: l.id,
    source: l.source,
    target: l.target,
    type: l.type,
  }), []);

  // Fetch complet des liens
  const fetchLinks = useCallback(async (): Promise<LinkType[]> => {
    console.log("[useLinks][fetchLinks] start");
    const { data, error } = await supabase.from("links").select("*");
    if (error) {
      console.error("[useLinks][fetchLinks] error", error);
      return [];
    }
    const mapped = (data as DBLink[]).map(mapDBLinkToApp);
    setLinks(mapped);
    console.log("[useLinks][fetchLinks] success", mapped);
    return mapped;
  }, [mapDBLinkToApp]);

  // Ajout d’un lien
  const addLink = useCallback(async (source: string, target: string, type: string | null = null): Promise<LinkType | null> => {
    const newId = uuidv4();
    const { data, error } = await supabase
      .from("links")
      .insert([{ id: newId, source, target, type }])
      .select();
    if (error) {
      console.error("[useLinks][addLink] error", error);
      return null;
    }
    const link = mapDBLinkToApp(data?.[0] as DBLink);
    setLinks(prev => [...prev, link]);
    console.log("[useLinks][addLink] success", link);
    return link;
  }, [mapDBLinkToApp]);

  // Suppression d’un lien
  const deleteLink = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (error) {
      console.error("[useLinks][deleteLink] error", error);
      return false;
    }
    setLinks(prev => prev.filter(l => l.id !== id));
    console.log("[useLinks][deleteLink] success", id);
    return true;
  }, []);

  return { links, fetchLinks, addLink, deleteLink };
}
