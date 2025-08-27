import { useState, useCallback } from "react";
import type { VisualLinkType } from "../types/VisualLinkType";
import { supabase } from "../lib/supabase";

/**
 * Hook pour gérer les visualLinks (fetch, add, remove)
 */
export function useVisualLinks() {
  const [visualLinks, setVisualLinks] = useState<VisualLinkType[]>([]);

  /** Récupère tous les visualLinks depuis Supabase */
  const fetchVisualLinks = useCallback(async () => {
    console.log("[data][visualLinks] fetching...");

    const { data, error } = await supabase.from("visual_links").select("*");

    if (error) {
      console.error("[data][visualLinks] error:", error);
      return;
    }

    setVisualLinks(data as VisualLinkType[]);
    console.log("[data][visualLinks] success:", data);
  }, []);

  /** Ajoute un visualLink en base */
  const addVisualLink = useCallback(
    async (source: string, target: string, type: string) => {
      console.log("[data][visualLinks] adding:", { source, target, type });

      const { data, error } = await supabase
        .from("visual_links")
        .insert([{ source, target, type }])
        .select()
        .single();

      if (error) {
        console.error("[data][visualLinks] add error:", error);
        return null;
      }

      setVisualLinks(prev => [...prev, data as VisualLinkType]);
      return data as VisualLinkType;
    },
    []
  );

  /** Supprime un visualLink en base */
  const removeVisualLink = useCallback(async (id: string) => {
    console.log("[data][visualLinks] removing:", id);

    const { error } = await supabase.from("visual_links").delete().eq("id", id);

    if (error) {
      console.error("[data][visualLinks] remove error:", error);
      return false;
    }

    setVisualLinks(prev => prev.filter(link => link.id !== id));
    return true;
  }, []);

  return { visualLinks, fetchVisualLinks, addVisualLink, removeVisualLink };
}
