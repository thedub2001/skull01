// src/app/MeshExplorerExtension.tsx

import molecule from "@dtinsight/molecule";
import type { IExtension } from "@dtinsight/molecule/esm/model";
import type { IExtensionService } from "@dtinsight/molecule/esm/services";
import { meshExplorerSidebar, meshExplorerActivityBar, meshExplorerMenuItem } from "../app/meshExplorerSidebar";

export class MeshExplorerExtension implements IExtension {
  id = "meshExplorer";
  name = "Mesh Explorer App";

  activate(_: IExtensionService): void {
    console.log("[MeshExplorerExtension] activate");

    molecule.sidebar.add(meshExplorerSidebar);
    molecule.activityBar.add(meshExplorerActivityBar);
    molecule.menuBar.append(meshExplorerMenuItem, "File");
  }

  dispose(_: IExtensionService): void {
    console.log("[MeshExplorerExtension] dispose");

    molecule.sidebar.remove(meshExplorerSidebar.id);
    molecule.activityBar.remove(meshExplorerActivityBar.id);
    molecule.menuBar.remove(meshExplorerMenuItem.id!);
  }
}
