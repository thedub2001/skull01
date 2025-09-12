// src/app/MeshExplorerAppSidebar.tsx
import React, { useCallback } from "react";
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

function MeshExplorerAppSidebarView() {
  const openEditorTab = useCallback(() => {
    molecule.editor.open(meshExplorerAppEditorTab);
  }, []);

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
            { id: "Catalogue", name: "Catalogue", renderPanel: () => <Header title="hola" toolbar={undefined} /> },
            { id: "Detail", name: "Detail", renderPanel: () => <Header title="carino" toolbar={undefined} /> },
          ]}
        />
      </Content>
    </div>
  );
}
