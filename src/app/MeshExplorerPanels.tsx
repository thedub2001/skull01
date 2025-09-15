// src/app/MeshExplorerPanels.tsx
import molecule from "@dtinsight/molecule";
import type { DbMode } from "./types/types";
import DbModeSelector from "./DbModeSelector";
import DatasetList, { type DatasetItem } from "./DatasetList";

const Collapse = molecule.component.Collapse;

const DEBUG_MODE = true;
function log(...args: any[]) {
  if (!DEBUG_MODE) return;
  console.log("[panels]", ...args);
}

export type MeshExplorerPanelsProps = {
  activeMode: DbMode;
  onChangeDbMode: (mode: DbMode) => void;
  datasets: DatasetItem[];
  activeDataset: { id: string; source: DbMode } | null;
  onSelectDataset: (id: string, source: DbMode) => void;
  onCreateDataset: (mode: DbMode) => Promise<void>;
  onResetLocal: () => void;
  onInspectIndexedDB: () => void;
};

/**
 * MeshExplorerPanels
 * Composant qui gère le Collapse principal avec:
 *  - Panel Databases (DbModeSelector)
 *  - Panel Datasets (DatasetList)
 */
export default function MeshExplorerPanels({
  activeMode,
  onChangeDbMode,
  datasets,
  activeDataset,
  onSelectDataset,
  onCreateDataset,
  onResetLocal,
  onInspectIndexedDB,
}: MeshExplorerPanelsProps) {
  return (
    <Collapse
      data={[
        {
          id: "Databases",
          name: "Bases de données",
          renderPanel: () => (
            <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <DbModeSelector activeMode={activeMode} onChangeMode={onChangeDbMode} />
            </div>
          ),
        },
        {
          id: "Datasets",
          name: "Choose Dataset",
          renderPanel: () => (
            <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <DatasetList
                datasets={datasets}
                activeDataset={activeDataset}
                onSelectDataset={onSelectDataset}
                onCreateDataset={onCreateDataset}
                onResetLocal={() => {
                  log("[click] resetLocal (prop)");
                  onResetLocal();
                }}
                onInspectIndexedDB={() => {
                  log("[click] inspectIndexedDB (prop)");
                  onInspectIndexedDB();
                }}
              />
            </div>
          ),
        },
      ]}
    />
  );
}
