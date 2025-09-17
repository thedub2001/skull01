// src/app/DatasetList.tsx
import { useCallback } from "react";
import type { DbMode } from "../../types/types";

const DEBUG_MODE = true;

/**
 * Type for a dataset item used in the sidebar.
 */
export type DatasetItem = {
  id: string;
  name: string;
  source: DbMode;
};

/**
 * Props for DatasetList component.
 */
export type DatasetListProps = {
  datasets: DatasetItem[];
  activeDataset: { id: string; source: DbMode } | null;
  onSelectDataset: (id: string, source: DbMode) => void;
  onCreateDataset: (mode: DbMode) => Promise<void>;
  onResetLocal: () => void;
  onInspectIndexedDB: () => void;
};

/**
 * DatasetList
 * Renders local and remote datasets, and provides create/reset/inspect actions.
 *
 * - Logs debug messages with labels: [dataset], [click], [data]
 * - Does not mutate datasets itself; uses callbacks passed via props.
 */
export default function DatasetList({
  datasets,
  activeDataset,
  onSelectDataset,
  onCreateDataset,
  onResetLocal,
  onInspectIndexedDB,
}: DatasetListProps) {
  const log = useCallback((...args: any[]) => {
    if (!DEBUG_MODE) return;
    // prefix each log with a dataset label
    console.log("[dataset]", ...args);
  }, []);

  if (DEBUG_MODE) log("[data] datasets prop", datasets, "activeDataset", activeDataset);

  return (
    <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Section Local Datasets */}
      <div>
        <strong>Local Datasets</strong>
        {datasets
          .filter((d) => d.source === "local")
          .map((ds) => {
            const isSelected = activeDataset?.id === ds.id && activeDataset?.source === ds.source;
            const isDuplicate = activeDataset?.id === ds.id && activeDataset?.source !== ds.source;

            return (
              <label
                key={`local-${ds.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "6px",
                  padding: "6px",
                  borderRadius: "4px",
                  background: isSelected ? "#16a34a" : isDuplicate ? "#f97316" : "transparent",
                  color: isSelected || isDuplicate ? "#fff" : "#ccc",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="radio"
                    name="dataset-local"
                    checked={isSelected}
                    onChange={() => {
                      log("[click] select local dataset", ds.id);
                      onSelectDataset(ds.id, "local");
                    }}
                  />
                  <span>{ds.name}</span>
                </div>
              </label>
            );
          })}
        <div style={{ marginTop: "6px" }}>
          <button
            onClick={async () => {
              log("[click] + New Local Dataset");
              await onCreateDataset("local");
            }}
          >
            + New Local Dataset
          </button>
        </div>
      </div>

      {/* Section Remote Datasets */}
      <div>
        <strong>Remote Datasets</strong>
        {datasets
          .filter((d) => d.source === "remote")
          .map((ds) => {
            const isSelected = activeDataset?.id === ds.id && activeDataset?.source === ds.source;
            const isDuplicate = activeDataset?.id === ds.id && activeDataset?.source !== ds.source;

            return (
              <label
                key={`remote-${ds.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "6px",
                  padding: "6px",
                  borderRadius: "4px",
                  background: isSelected ? "#16a34a" : isDuplicate ? "#f97316" : "transparent",
                  color: isSelected || isDuplicate ? "#fff" : "#ccc",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="radio"
                    name="dataset-remote"
                    checked={isSelected}
                    onChange={() => {
                      log("[click] select remote dataset", ds.id);
                      onSelectDataset(ds.id, "remote");
                    }}
                  />
                  <span>{ds.name}</span>
                </div>
              </label>
            );
          })}
        <div style={{ marginTop: "6px" }}>
          <button
            onClick={async () => {
              log("[click] + New Remote Dataset");
              await onCreateDataset("remote");
            }}
          >
            + New Remote Dataset
          </button>
        </div>
      </div>

      {/* Utility Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
        <button
          style={{ background: "#dc2626", color: "white", padding: "6px", borderRadius: "4px" }}
          onClick={() => {
            log("[click] Reset Local Storage");
            onResetLocal();
          }}
        >
          ­ƒùæ Reset Local Storage
        </button>

        <button
          style={{ background: "#268c26", color: "white", padding: "6px", borderRadius: "4px" }}
          onClick={() => {
            log("[click] Check Local Storage");
            onInspectIndexedDB();
          }}
        >
          Check Local Storage
        </button>
      </div>
    </div>
  );
}
