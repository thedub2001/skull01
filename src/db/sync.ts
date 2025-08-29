// db/sync.ts
import * as local from "./localDB";
import * as remote from "./remoteDB";
import { supabase } from "../lib/supabase";
import type { NodeType, LinkType } from "../types/graph";
import type { VisualLink } from "../utils/addDynamicVisualLinks";

/**
 * Lance la réplication temps réel Supabase → Local
 */
export function initRealtimeSync() {
  console.log("[sync] init realtime sync");

  // --- Exemple : écoute table nodes ---
  supabase
    .channel("nodes-sync")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "nodes" },
      async (payload) => {
        console.log("[sync] nodes change:", payload);
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          await local.put("nodes", payload.new as NodeType);
        } else if (payload.eventType === "DELETE") {
          await local.remove("nodes", payload.old.id);
        }
      }
    )
    .subscribe();

  // TODO : répéter pour links et visual_links
}

/**
 * Push local → remote
 */
export async function pushLocalToRemote() {
  const data = await local.exportDB();
  console.log("[sync] push local → remote", data);
  await Promise.all([
    ...data.nodes.map((n) => remote.addNode(n)),
    ...data.links.map((l) => remote.addLink(l)),
    ...data.visual_links.map((vl) => remote.addVisualLink(vl)),
  ]);
}

/**
 * Pull remote → local
 */
export async function pullRemoteToLocal() {
  console.log("[sync] pull remote → local");
  const nodes = await remote.fetchNodes();
  const links = await remote.fetchLinks();
  const visual_links = await remote.fetchVisualLinks();
  await local.importDB({ nodes, links, visual_links });
}
