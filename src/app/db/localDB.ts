// db/localDB.ts
import { openDB, type IDBPDatabase } from "idb";
import type { NodeType, LinkType } from "../types/graph";
import type { VisualLink } from "../utils/addDynamicVisualLinks";

type DBSchema = {
  nodes: NodeType;
  links: LinkType;
  visual_links: VisualLink;
};

let db: IDBPDatabase<DBSchema> | null = null;

/**
 * Initialise la base IndexedDB
 */
export async function initLocalDB() {
  if (db) return db;

  db = await openDB<DBSchema>("graphDB", 1, {
    upgrade(upgradeDB) {
      if (!upgradeDB.objectStoreNames.contains("nodes")) {
        upgradeDB.createObjectStore("nodes", { keyPath: "id" });
      }
      if (!upgradeDB.objectStoreNames.contains("links")) {
        upgradeDB.createObjectStore("links", { keyPath: "id" });
      }
      if (!upgradeDB.objectStoreNames.contains("visual_links")) {
        upgradeDB.createObjectStore("visual_links", { keyPath: "id" });
      }
    },
  });

  console.log("[localDB] Initialisé");
  return db;
}

/**
 * Helpers génériques
 */
async function getStore<T extends keyof DBSchema>(
  storeName: T,
  mode: IDBTransactionMode = "readonly"
) {
  const database = await initLocalDB();
  return database.transaction(storeName, mode).objectStore(storeName);
}

/**
 * CRUD génériques
 */
export async function getAll<T extends keyof DBSchema>(
  store: T
): Promise<DBSchema[T][]> {
  const s = await getStore(store);
  return s.getAll();
}

export async function addItem<T extends keyof DBSchema>(
  store: T,
  item: DBSchema[T]
) {
  const s = await getStore(store, "readwrite");
  await s.put(item);
  console.log(`[localDB] [${store}] ajouté`, item);
}

export async function deleteItem<T extends keyof DBSchema>(
  store: T,
  id: string
) {
  const s = await getStore(store, "readwrite");
  await s.delete(id);
  console.log(`[localDB] [${store}] supprimé id=${id}`);
}

/**
 * Export / Import complet (JSON)
 */
export async function exportDB(): Promise<Record<string, unknown[]>> {
  const nodes = await getAll("nodes");
  const links = await getAll("links");
  const visual_links = await getAll("visual_links");

  return { nodes, links, visual_links };
}

export async function importDB(data: {
  nodes: NodeType[];
  links: LinkType[];
  visual_links: VisualLink[];
}) {
  for (const n of data.nodes) {
    const node = { id: n.id, label: n.label, level: n.level }; // strip functions/Three.js objects
    await addItem("nodes", node);
  }
  for (const l of data.links) await addItem("links", l);
  for (const vl of data.visual_links) {
    const vlCopy = { id: vl.id, source: vl.source, target: vl.target, type: vl.type, metadata: vl.metadata || {} };
    await addItem("visual_links", vlCopy);
  }
  console.log("[localDB] Import terminé");
}

