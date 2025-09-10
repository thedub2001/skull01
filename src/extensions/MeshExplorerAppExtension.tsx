// src/workbench/AppExtension.tsx
import React from "react";
import molecule from "@dtinsight/molecule";
import type { IExtension } from "@dtinsight/molecule/esm/model";
import type { IExtensionService } from "@dtinsight/molecule/esm/services";
import { meshExplorerAppSidebar } from "../app/meshExplorerAppSidebar"

//import SideBar from "../app/sideBar"; // composant métier

export class MeshExplorerAppExtension implements IExtension {
  id = "meshExplorerApp";
  name = "Mesh explorer app";

  activate(extensionCtx: IExtensionService): void {
        console.log("[AppExtension] activate");
        molecule.sidebar.add(meshExplorerAppSidebar);
  }

  dispose(extensionCtx: IExtensionService): void {
        console.log("[AppExtension] dispose");
        molecule.sidebar.remove(meshExplorerAppSidebar.id);
  }
}
