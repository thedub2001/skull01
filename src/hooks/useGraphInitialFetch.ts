import { useEffect } from "react";

/**
 * Hook pour effectuer le fetch initial des nodes, links et visualLinks.
 */
export function useGraphInitialFetch(
  fetchGraphData: () => Promise<unknown>,
  fetchLinks: () => Promise<unknown>,
  fetchVisualLinks: () => Promise<unknown>
) {
  useEffect(() => {
    (async () => {
      console.log("[graph][fetch] Initial fetch nodes & links");
      await fetchGraphData();
      await fetchLinks();
      await fetchVisualLinks();
    })();
  }, [fetchGraphData, fetchLinks, fetchVisualLinks]);
}
