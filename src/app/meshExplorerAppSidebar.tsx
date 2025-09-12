// src/app/MeshExplorerAppSidebar.tsx
import React, { useCallback, useState, useEffect } from "react";
import molecule from "@dtinsight/molecule";
import type { IActivityBarItem, IMenuBarItem, ISidebarPane } from "@dtinsight/molecule/esm/model";
import { localize } from "@dtinsight/molecule/esm/i18n/localize";
import { Header, Content } from "@dtinsight/molecule/esm/workbench/sidebar";
import { meshExplorerAppEditorTab } from "./meshExplorerAppEditorTab";

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

const dbOptions: { mode: DbMode; label: string; description: string }[] = [
  { mode: "local", label: "IndexedDB (Local)", description: "Stockage local (idb)" },
  { mode: "remote", label: "Supabase (Remote)", description: "Connexion à Supabase" },
  { mode: "sync", label: "Sync (Local + Remote)", description: "Mode synchronisé" },
];

function MeshExplorerAppSidebarView() {
  const openEditorTab = useCallback(() => {
    console.log("[Sidebar] openEditorTab clicked");
    molecule.editor.open(meshExplorerAppEditorTab);
  }, []);

  // --- State local pour le dbMode (initialisé depuis settings) ---
  const [activeMode, setActiveModeState] = useState<DbMode>("local");

  // --- Sync avec Molecule settings ---
useEffect(() => {
  const settings = molecule.settings.getSettings();
  const initialMode = (settings as any).dbMode || "local";
  console.log("[Sidebar] Loaded dbMode from settings:", initialMode);
  setActiveModeState(initialMode);

  // Listener sur changement settings
  molecule.settings.onChangeSettings((newSettings) => {
    console.log("[Sidebar] settings changed:", newSettings);
    if ((newSettings as any).dbMode) {
      setActiveModeState((newSettings as any).dbMode);
    }
  });

  // Pas de cleanup car onChangeSettings retourne void
}, []);

  const setActiveMode = (mode: DbMode) => {
    console.log("[Sidebar] Setting dbMode to:", mode);
    setActiveModeState(mode);
    molecule.settings.update({ dbMode: mode });
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
                <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {dbOptions.map((db) => (
                    <label
                      key={db.mode}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "6px",
                        borderRadius: "4px",
                        background: activeMode === db.mode ? "#2563eb" : "transparent",
                        color: activeMode === db.mode ? "#fff" : "#ccc",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <input
                          type="radio"
                          name="dbMode"
                          checked={activeMode === db.mode}
                          onChange={() => setActiveMode(db.mode)}
                        />
                        <span>{db.label}</span>
                      </div>
                      <span style={{ fontSize: "11px", opacity: 0.7 }}>{db.description}</span>
                    </label>
                  ))}
                </div>
              ),
            },
            {
              id: "Detail",
              name: "Detail",
              renderPanel: () => <Header title="carino" toolbar={undefined} />,
            },
          ]}
        />
      </Content>
    </div>
  );
}
