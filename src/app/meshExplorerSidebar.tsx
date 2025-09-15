// src/app/meshExplorerSidebar.tsx
import { useCallback, useEffect, useState } from "react";
import molecule from "@dtinsight/molecule";
import type { IActivityBarItem, IMenuBarItem, ISidebarPane } from "@dtinsight/molecule/esm/model";
import { localize } from "@dtinsight/molecule/esm/i18n/localize";
import { Header, Content } from "@dtinsight/molecule/esm/workbench/sidebar";
import { meshExplorerEditorTab } from "./meshExplorerEditorTab";
import {
  listLocalDatasets,
  resetLocal,
  inspectIndexedDB,
} from "./db/localDB";
import { listRemoteDatasets } from "./db/remoteDB";
import type { DbMode } from "./types/types";
import type { DatasetItem } from "./DatasetList";

import MeshExplorerToolbar from "./MeshExplorerToolbar";
import MeshExplorerPanels from "./MeshExplorerPanels";
import { useMeshExplorerSettings } from "./useMeshExplorerSettings";
import { useDatasetActions } from "./useDatasetActions";

export const MESH_EXPLORER_APP_ID = "meshExplorerPane";

export const meshExplorerSidebar: ISidebarPane = {
  id: MESH_EXPLORER_APP_ID,
  title: "Mesh Explorer",
  render: () => <MeshExplorerSidebarView />,
};

export const meshExplorerActivityBar: IActivityBarItem = {
  id: MESH_EXPLORER_APP_ID,
  sortIndex: -1,
  name: "Mesh Explorer",
  title: "Mesh Explorer App",
  icon: "type-hierarchy",
};

export const meshExplorerMenuItem: IMenuBarItem = {
  id: "menu.meshExplorer",
  name: localize("menu.meshExplorer", "Mesh Explorer Menu"),
  icon: "type-hierarchy",
};

const DEBUG_MODE = true;
function log(...args: any[]) {
  if (!DEBUG_MODE) return;
  console.log("[sidebar]", ...args);
}

export default function MeshExplorerSidebarView() {
  const openEditorTab = useCallback(() => {
    log("[click] openEditorTab clicked");
    molecule.editor.open(meshExplorerEditorTab);
  }, []);

  // --- Hook pour settings ---
  const { activeMode, activeDataset, handleDbModeChange, handleDatasetChange } = useMeshExplorerSettings();

  // --- State pour datasets ---
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);

  // --- Hook pour actions sur datasets (création) ---
  const { createDataset } = useDatasetActions((newDs) => setDatasets((prev) => [...prev, newDs]));

  // --- Charger les datasets (local + remote) séparément ---
  useEffect(() => {
    async function fetchDatasets() {
      try {
        log("[sidebar] fetchDatasets start");
        const local = await listLocalDatasets();
        const remote = await listRemoteDatasets();

        const localWithSource: DatasetItem[] = local.map((d) => ({ ...d, source: "local" as DbMode }));
        const remoteWithSource: DatasetItem[] = remote.map((d) => ({ ...d, source: "remote" as DbMode }));

        const merged = [...localWithSource, ...remoteWithSource];
        setDatasets(merged);
        log("[sidebar] fetchDatasets done", { localCount: local.length, remoteCount: remote.length, mergedCount: merged.length });
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
