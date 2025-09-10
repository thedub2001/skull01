// src/app/MeshExplorerAppExtension.tsx

import React from "react";
import molecule from "@dtinsight/molecule";
import type { IExtension } from "@dtinsight/molecule/esm/model";
import type { IExtensionService } from "@dtinsight/molecule/esm/services";
import { meshExplorerAppSidebar, meshExplorerAppActivityBar, meshExplorerAppMenuItem } from "../app/meshExplorerAppSidebar";

export class MeshExplorerAppExtension implements IExtension {
  id = "meshExplorerApp";
  name = "Mesh Explorer App";

  activate(_: IExtensionService): void {
    console.log("[MeshExplorerAppExtension] activate");

    molecule.sidebar.add(meshExplorerAppSidebar);
    molecule.activityBar.add(meshExplorerAppActivityBar);
    molecule.menuBar.append(meshExplorerAppMenuItem, "File");
  }

  dispose(_: IExtensionService): void {
    console.log("[MeshExplorerAppExtension] dispose");

    molecule.sidebar.remove(meshExplorerAppSidebar.id);
    molecule.activityBar.remove(meshExplorerAppActivityBar.id);
    molecule.menuBar.remove(meshExplorerAppMenuItem.id!);
  }
}
