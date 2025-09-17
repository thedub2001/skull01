// src/app/hooks/useDatasetActions.ts
import { useCallback } from "react";
import type { DbMode } from "../types/types";
import type { DatasetItem } from "../components/sidebar/DatasetList";
import { createLocalDataset } from "../db/localDB";
import { createRemoteDataset } from "../db/remoteDB";

const DEBUG_MODE = true;
function log(...args: any[]) {
  if (!DEBUG_MODE) return;
  console.log("[datasetActions]", ...args);
}

export function useDatasetActions(onUpdateDatasets: (newDs: DatasetItem) => void) {
  const createDataset = useCallback(
    async (mode: DbMode) => {
      log("[click] createDataset", mode);
      const name = prompt(`Nom du dataset ${mode}?`);
      if (!name) {
        log("[dataset] create aborted (no name)");
        return;
      }

      try {
        let newDs: { id: string; name: string } | null = null;
        if (mode === "local") {
          newDs = await createLocalDataset(name, mode);
        } else if (mode === "remote") {
          newDs = await createRemoteDataset(name, mode);
        }
        if (newDs) {
          const dsItem: DatasetItem = { ...newDs, source: mode };
          onUpdateDatasets(dsItem);
          log("[dataset] created", dsItem);
        }
      } catch (err) {
        console.error("[datasetActions] Failed to create dataset:", err);
      }
    },
    [onUpdateDatasets]
  );

  return { createDataset };
}
