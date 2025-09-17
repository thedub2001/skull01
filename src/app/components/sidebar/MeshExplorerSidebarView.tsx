// src/components/sidebar/MeshExplorerSidebarView.tsx
import { useCallback, useEffect, useState } from "react";
import molecule from "@dtinsight/molecule";
import { localize } from "@dtinsight/molecule/esm/i18n/localize";
import { Header, Content } from "@dtinsight/molecule/esm/workbench/sidebar";

import { meshExplorerEditorTab } from "../../meshExplorerEditorTab";
import { listLocalDatasets, resetLocal, inspectIndexedDB } from "../../db/localDB";
import { listRemoteDatasets } from "../../db/remoteDB";
import type { DbMode } from "../../types/types";
import type { DatasetItem } from "../../components/sidebar/DatasetList";

import MeshExplorerToolbar from "../../components/sidebar/MeshExplorerToolbar";
import MeshExplorerPanels from "../../components/sidebar/MeshExplorerPanels";
import { useMeshExplorerSettings } from "../../hooks/useMeshExplorerSettings";
import { useDatasetActions } from "../../hooks/useDatasetActions";

/**
 * NOTE:
 * - Ce fichier est la vue React pure (ex-`MeshExplorerSidebarView`) extraite du fichier app.
 * - J'ai conservé les logs et le comportement d'origine.
 */

const DEBUG_MODE = true;
function log(...args: unknown[]) {
  if (!DEBUG_MODE) return;
  // eslint-disable-next-line no-console
  console.log("[sidebar]", ...args);
}

export default function MeshExplorerSidebarView() {
  const openEditorTab = useCallback(() => {
    log("[click] openEditorTab clicked");
    molecule.editor.open(meshExplorerEditorTab);
  }, []);

  // --- Hook pour settings (signatures préservées) ---
  const { activeMode, activeDataset, handleDbModeChange, handleDatasetChange } =
    useMeshExplorerSettings();

  // --- State pour datasets ---
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);

  // --- Hook pour actions sur datasets (création) ---
  // Le hook attend un argument (onUpdateDatasets) — on le fournit ici.
  const { createDataset } = useDatasetActions((newDs: DatasetItem) =>
    setDatasets((prev) => [...prev, newDs])
  );

  // --- Charger les datasets (local + remote) séparément ---
  useEffect(() => {
    async function fetchDatasets() {
      try {
        log("[sidebar] fetchDatasets start");
        const local = await listLocalDatasets();
        const remote = await listRemoteDatasets();

        const localWithSource: DatasetItem[] = local.map((d) => ({
          ...d,
          source: "local" as DbMode,
        }));
        const remoteWithSource: DatasetItem[] = remote.map((d) => ({
          ...d,
          source: "remote" as DbMode,
        }));

        const merged = [...localWithSource, ...remoteWithSource];
        setDatasets(merged);
        log("[sidebar] fetchDatasets done", {
          localCount: local.length,
          remoteCount: remote.length,
          mergedCount: merged.length,
        });
      } catch (err) {
        console.error("[sidebar] Error fetching datasets:", err);
      }
    }

    fetchDatasets();
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Header
        title={localize("meshExplorer.sidebar.title", "Mesh Explorer")}
        toolbar={<MeshExplorerToolbar onOpenEditorTab={openEditorTab} />}
      />
      <Content>
        <MeshExplorerPanels
          activeMode={activeMode}
          onChangeDbMode={handleDbModeChange}
          datasets={datasets}
          activeDataset={activeDataset}
          onSelectDataset={handleDatasetChange}
          onCreateDataset={createDataset}
          onResetLocal={resetLocal}
          onInspectIndexedDB={inspectIndexedDB}
        />
      </Content>
    </div>
  );
}
