// src/app/MeshExplorerSidebar.tsx
import type {
  ISidebarPane,
  IActivityBarItem,
  IMenuBarItem,
} from "@dtinsight/molecule/esm/model";
import { localize } from "@dtinsight/molecule/esm/i18n/localize";

import MeshExplorerSidebarView from "./components/sidebar/MeshExplorerSidebarView";

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
