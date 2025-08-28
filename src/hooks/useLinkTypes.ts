// hooks/useLinkTypes.ts
import { useMemo } from "react";
import type { LinkType } from "../types/graph";

export function useLinkTypes(links: LinkType[]) {
  return useMemo(() => {
    const uniqueTypes = new Set<string>();
    links.forEach((link) => {
      if (link.type) uniqueTypes.add(link.type);
    });
    return Array.from(uniqueTypes);
  }, [links]);
}
