//sidebarHelpers.ts
import type { DbMode } from "../types/types";
import { listLocalDatasets, createLocalDataset } from "../db/localDB";
import { listRemoteDatasets, createRemoteDataset } from "../db/remoteDB";

/** Charge tous les datasets locaux + remote */
export async function fetchAllDatasets(): Promise<{ id: string; name: string; source: DbMode }[]> {
  console.log("[Sidebar][debug] fetchAllDatasets called");
  const local = await listLocalDatasets();
  const remote = await listRemoteDatasets();

  const localWithSource = local.map((d) => ({ ...d, source: "local" as DbMode }));
  const remoteWithSource = remote.map((d) => ({ ...d, source: "remote" as DbMode }));

  return [...localWithSource, ...remoteWithSource];
}

/** Crée un dataset selon le mode */
export async function createDataset(name: string, mode: DbMode) {
  console.log(`[Sidebar][debug] createDataset called with name=${name}, mode=${mode}`);
  if (mode === "local") return createLocalDataset(name, mode);
  if (mode === "remote") return createRemoteDataset(name, mode);
  return null;
}
