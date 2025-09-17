import React from "react";
import { fetchGraphData, fetchVisualLinks } from "../db/adapter";
import type { NodeType, LinkType, VisualLinkType, DbMode } from "../types/types";

const DEBUG_MODE = true;
const PREFIX = "[useGraphDataFetch]";

function dbg(...args: unknown[]) {
  if (DEBUG_MODE) console.log(PREFIX, ...args);
}

export function useGraphDataFetch(
  dbMode: DbMode,
  dataset: string | null,
  setNodes: React.Dispatch<React.SetStateAction<NodeType[]>>,
  setLinks: React.Dispatch<React.SetStateAction<LinkType[]>>,
  setVisualLinks: React.Dispatch<React.SetStateAction<VisualLinkType[]>>
) {
  React.useEffect(() => {
    (async () => {
      if (!dataset) {
        dbg("no dataset selected -> resetting states");
        setNodes([]);
        setLinks([]);
        setVisualLinks([]);
        return;
      }

      try {
        console.log(PREFIX, "Initial fetch nodes & links");
        // Fetch nodes and links together
        const { nodes, links } = await fetchGraphData(dbMode, dataset);
        setNodes(nodes);
        setLinks(links);
        dbg("loaded nodes count=", nodes.length, "links count=", links.length);

        // Fetch visual links
        const fetchedVisualLinks = await fetchVisualLinks(dbMode, dataset);
        setVisualLinks(fetchedVisualLinks);
        dbg("loaded visualLinks count=", fetchedVisualLinks.length);
      } catch (err) {
        console.error(PREFIX, "fetch ERROR:", err);
        setNodes([]);
        setLinks([]);
        setVisualLinks([]);
      }
    })();
  }, [dbMode, dataset, setNodes, setLinks, setVisualLinks]);
}