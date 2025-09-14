// src/app/MeshExplorerAppSidebar.tsx
import React, { useCallback, useState, useEffect } from "react";
import molecule from "@dtinsight/molecule";
import type { IActivityBarItem, IMenuBarItem, ISidebarPane } from "@dtinsight/molecule/esm/model";
import { localize } from "@dtinsight/molecule/esm/i18n/localize";
import { Header, Content } from "@dtinsight/molecule/esm/workbench/sidebar";
import { meshExplorerAppEditorTab } from "./meshExplorerAppEditorTab";
import { listLocalDatasets, createLocalDataset, resetLocal, inspectIndexedDB } from "./db/localDB";
import { listRemoteDatasets, createRemoteDataset } from "./db/remoteDB";

export const MESH_EXPLORER_APP_ID = "meshExplorerPane";

export const meshExplorerAppSidebar: ISidebarPane = {
  id: MESH_EXPLORER_APP_ID,
  title: "Mesh Explorer",
  render: () => <MeshExplorerAppSidebarView />,
};

export const meshExplorerAppActivityBar: IActivityBarItem = {
  id: MESH_EXPLORER_APP_ID,
  sortIndex: -1,
  name: "Mesh Explorer",
  title: "Mesh Explorer App",
  icon: "type-hierarchy",
};

export const meshExplorerAppMenuItem: IMenuBarItem = {
  id: "menu.meshExplorerApp",
  name: localize("menu.meshExplorerApp", "Mesh Explorer Menu"),
  icon: "type-hierarchy",
};

const Toolbar = molecule.component.Toolbar;
const Collapse = molecule.component.Collapse;

type DbMode = "local" | "remote" | "sync";

function MeshExplorerAppSidebarView() {
  const openEditorTab = useCallback(() => {
    console.log("[Sidebar] openEditorTab clicked");
    molecule.editor.open(meshExplorerAppEditorTab);
  }, []);

  // --- State pour DB Mode ---
  const [activeMode, setActiveMode] = useState<DbMode>("local");

  // --- State pour datasets ---
  const [datasets, setDatasets] = useState<{ id: string; name: string; source: DbMode }[]>([]);
  const [activeDataset, setActiveDataset] = useState<{ id: string; source: DbMode } | null>(null);

  // --- Load settings on mount ---
  useEffect(() => {
    const settings = molecule.settings.getSettings();
    setActiveMode((settings as any).dbMode || "local");
    setActiveDataset((settings as any).dataset || null);

    molecule.settings.onChangeSettings((newSettings) => {
      if ((newSettings as any).dbMode) setActiveMode((newSettings as any).dbMode);
      if ((newSettings as any).dataset) setActiveDataset((newSettings as any).dataset);
    });
  }, []);

  // --- Charger les datasets (local + remote) séparément ---
  useEffect(() => {
    async function fetchDatasets() {
      try {
        const local = await listLocalDatasets();
        const remote = await listRemoteDatasets();

        const localWithSource = local.map((d) => ({ ...d, source: "local" as DbMode }));
        const remoteWithSource = remote.map((d) => ({ ...d, source: "remote" as DbMode }));

        setDatasets([...localWithSource, ...remoteWithSource]);
      } catch (err) {
        console.error("[Sidebar] Error fetching datasets:", err);
      }
    }
    fetchDatasets();
  }, []);

  const handleDbModeChange = (mode: DbMode) => {
    setActiveMode(mode);
    molecule.settings.update({ dbMode: mode });
  };

  const handleDatasetChange = (id: string, source: DbMode) => {
    setActiveDataset({ id, source });
    molecule.settings.update({ dataset: id });
  };

  const handleCreateDataset = async (mode: DbMode) => {
    const name = prompt(`Nom du dataset ${mode}?`);
    if (!name) return;

    try {
      let newDs;
      if (mode === "local") {
        newDs = await createLocalDataset(name, mode);
      } else if (mode === "remote") {
        newDs = await createRemoteDataset(name, mode);
      }
      if (newDs) {
        setDatasets((prev) => [...prev, { ...newDs, source: mode }]);
      }
    } catch (err) {
      console.error("[Sidebar] Failed to create dataset:", err);
    }
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Header
        title={localize("meshExplorer.sidebar.title", "Mesh Explorer")}
        toolbar={
          <Toolbar
            data={[
              { icon: "refresh", id: "reload", title: "Reload", onClick: openEditorTab },
              { icon: "add", id: "showMesh", title: "Show Mesh", onClick: openEditorTab },
            ]}
          />
        }
      />
      <Content>
        <Collapse
          data={[
            {
              id: "Databases",
              name: "Bases de données",
              renderPanel: () => (
                <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {(["local", "remote", "sync"] as DbMode[]).map((db) => (
                    <label
                      key={db}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "6px",
                        borderRadius: "4px",
                        background: activeMode === db ? "#2563eb" : "transparent",
                        color: activeMode === db ? "#fff" : "#ccc",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <input
                          type="radio"
                          name="dbMode"
                          checked={activeMode === db}
                          onChange={() => handleDbModeChange(db)}
                        />
                        <span>{db}</span>
                      </div>
                    </label>
                  ))}
                </div>
              ),
            },
            {
              id: "Datasets",
              name: "Choose Dataset",
              renderPanel: () => (
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
                              background: isSelected
                                ? "#16a34a"
                                : isDuplicate
                                ? "#f97316"
                                : "transparent",
                              color: isSelected || isDuplicate ? "#fff" : "#ccc",
                              cursor: "pointer",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <input
                                type="radio"
                                name="dataset-local"
                                checked={isSelected}
                                onChange={() => handleDatasetChange(ds.id, "local")}
                              />
                              <span>{ds.name}</span>
                            </div>
                          </label>
                        );
                      })}
                    <button onClick={() => handleCreateDataset("local")}>+ New Local Dataset</button>
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
                              background: isSelected
                                ? "#16a34a"
                                : isDuplicate
                                ? "#f97316"
                                : "transparent",
                              color: isSelected || isDuplicate ? "#fff" : "#ccc",
                              cursor: "pointer",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <input
                                type="radio"
                                name="dataset-remote"
                                checked={isSelected}
                                onChange={() => handleDatasetChange(ds.id, "remote")}
                              />
                              <span>{ds.name}</span>
                            </div>
                          </label>
                        );
                      })}
                    <button onClick={() => handleCreateDataset("remote")}>+ New Remote Dataset</button>
                  </div>


                  {/* Boutons utilitaires */}
                  <button
                    style={{ marginTop: "8px", background: "#dc2626", color: "white", padding: "6px", borderRadius: "4px" }}
                    onClick={resetLocal}
                  >
                    🗑 Reset Local Storage
                  </button>
                  <button
                    style={{ marginTop: "8px", background: "#268c26", color: "white", padding: "6px", borderRadius: "4px" }}
                    onClick={inspectIndexedDB}
                  >
                    Check Local Storage
                  </button>
                </div>
              ),
            },
          ]}
        />
      </Content>
    </div>
  );
}

export default MeshExplorerAppSidebarView;
