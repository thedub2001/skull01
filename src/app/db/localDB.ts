// app/db/localDB.ts
import { openDB, type IDBPDatabase } from "idb";
import type { NodeType, LinkType } from "../types/graph";
import type { VisualLinkType } from "../types/VisualLinkType";
import type { DatasetRow } from "./remoteDB";
import { v4 as uuidv4 } from "uuid";
import molecule from "@dtinsight/molecule";


type DBSchema = {
  nodes: NodeType;
  links: LinkType;
  visual_links: VisualLinkType;
  datasets: DatasetRow;
};

let db: IDBPDatabase<DBSchema> | null = null;


export async function inspectIndexedDB() {
  if (!("indexedDB" in window)) {
    console.warn("IndexedDB not supported in this browser.");
    return;
  }

  const dbs = await (window.indexedDB.databases?.() || []);
  console.log("[inspectIndexedDB] databases found:", dbs);

  for (const { name, version } of dbs) {
    if (!name) continue;

    console.log(`\n📂 Database: ${name} (v${version})`);

    // Ouvrir la DB
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(name);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    // Parcourir les stores
    for (const storeName of db.objectStoreNames) {
      const count = await new Promise<number>((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const req = store.count();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      console.log(`   🗂 ${storeName}: ${count} rows`);

      // Lire le contenu complet
      const content = await new Promise<any[]>((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      console.log(`   📑 Content of ${storeName}:`, content);
    }

    db.close();
  }
}


/**
 * Liste tous les datasets stockés localement dans IndexedDB
 */
export async function listLocalDatasets(): Promise<DatasetRow[]> {
  await initLocalDB();
  const datasets = await getAll("datasets");
  console.log("[datasetUtils] listLocalDatasets:", datasets);
  const nodes = await getAll("nodes");
  console.log("[datasetUtils] listLocalnodes:", nodes);
  const links = await getAll("links");
  console.log("[datasetUtils] listLocallinks:", links);
  const visualLinks = await getAll("visual_links");
  console.log("[datasetUtils] listLocalvisualLinks:", visualLinks);
  return datasets;
}

export async function resetLocal() {
  

  console.log("[resetLocal] clearing localStorage + deleting IndexedDB graphDB");

  // Vider localStorage
  localStorage.clear();

  // Supprimer IndexedDB
  indexedDB.deleteDatabase("graphDB");

  console.log("[resetLocal] done. Please reload the page.");
}

/**
 * Crée un nouveau dataset local dans IndexedDB
 */
export async function createLocalDataset(name: string, user = "rien"): Promise<DatasetRow> {
  await initLocalDB();

  // --- Créer le dataset ---
  const newDataset: DatasetRow = {
    id: uuidv4(),
    name,
    created_at: new Date().toISOString(),
    user: molecule.settings.getSettings().user,
    metadata: {},
  };
  await addItem("datasets", newDataset);
  console.log("[datasetUtils] createLocalDataset:", newDataset);

  // --- Créer un nœud initial pour ce dataset ---
  const initialNode: NodeType = {
    id: uuidv4(),
    label: "Root Node",
    type: "root",
    dataset: newDataset.id,
  };
  await addItem("nodes", initialNode);
  console.log("[datasetUtils] createLocalDataset: nœud initial ajouté", initialNode);

  return newDataset;
}

/**
 * Initialise la base IndexedDB avec indexes par dataset
 */
export async function initLocalDB() {
  if (db) return db;

  db = await openDB<DBSchema>("graphDB", 3, {
    upgrade(upgradeDB, oldVersion) {
      if (!upgradeDB.objectStoreNames.contains("nodes")) {
        const store = upgradeDB.createObjectStore("nodes", { keyPath: "id" });
        store.createIndex("by_dataset", "dataset");
      }
      if (!upgradeDB.objectStoreNames.contains("links")) {
        const store = upgradeDB.createObjectStore("links", { keyPath: "id" });
        store.createIndex("by_dataset", "dataset");
      }
      if (!upgradeDB.objectStoreNames.contains("visual_links")) {
        const store = upgradeDB.createObjectStore("visual_links", { keyPath: "id" });
        store.createIndex("by_dataset", "dataset");
      }
      if (!upgradeDB.objectStoreNames.contains("datasets")) {
        upgradeDB.createObjectStore("datasets", { keyPath: "id" });
      }
    },
  });

  console.log("[localDB] Initialisé avec indexes");
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

export async function getAllByDataset<T extends keyof DBSchema>(
  store: T,
  datasetId: string
): Promise<DBSchema[T][]> {
  const s = await getStore(store);
  if (!s.indexNames.contains("by_dataset")) {
    console.warn(`[localDB] getAllByDataset: no index on ${store}, fallback to getAll`);
    const all = await s.getAll();
    return all.filter((item: any) => item.dataset === datasetId);
  }
  return s.index("by_dataset").getAll(datasetId);
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
 * Export / Import par dataset
 */
export async function exportDB(datasetId: string) {
  const [nodes, links, visual_links] = await Promise.all([
    getAllByDataset("nodes", datasetId),
    getAllByDataset("links", datasetId),
    getAllByDataset("visual_links", datasetId),
  ]);
  const datasets = await getAll("datasets");

  return { nodes, links, visual_links, datasets };
}

export async function importDB(
  data: {
    nodes: NodeType[];
    links: LinkType[];
    visual_links: VisualLinkType[];
    datasets?: DatasetRow[];
  },
  datasetId: string
) {
  for (const n of data.nodes) await addItem("nodes", { ...n, dataset: datasetId });
  for (const l of data.links) await addItem("links", { ...l, dataset: datasetId });
  for (const vl of data.visual_links) await addItem("visual_links", { ...vl, dataset: datasetId });
  if (data.datasets) {
    for (const ds of data.datasets) await addItem("datasets", ds);
  }
  console.log(`[localDB] Import terminé pour dataset=${datasetId}`);
}
