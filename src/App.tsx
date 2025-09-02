// App.tsx
import React from "react";
import { create, Workbench, molecule } from "@dtinsight/molecule";
import { IContributeType, IExtension } from '@dtinsight/molecule/esm/model';
import { IExtensionService } from '@dtinsight/molecule/esm/services';
import "@dtinsight/molecule/esm/style/mo.css";

import GraphApp from "./GraphApp"; // ← ton app actuelle déplacée ici (SettingsPanel+GraphWrapper+InfoPanel)

console.log("[molecule][init] starting App.tsx");

// --- Extension Molecule ---
// On crée un panneau central pour afficher GraphApp
const GraphExtension: IExtension = {
  id: "graph.extension",
  name: "Graph Extension",
  activate(extensionCtx: IExtensionService) {
    console.log("[molecule][activate] GraphExtension activée");

    molecule.panel.add({
      id: "graph.panel",
      name: "Graph Panel",
      render: () => {
        console.log("[molecule][render] GraphPanel rendu");
        return <GraphApp />;
      },
    });

    // Option : sélectionner ce panel au démarrage
    molecule.panel.setActive("graph.panel");
  },
  dispose(extensionCtx: IExtensionService) {
    console.log("[molecule][dispose] GraphExtension supprimée");
  },
};

// --- Création Molecule ---
const moInstance = create({
  extensions: [GraphExtension],
});

const App = () => {
  console.log("[molecule][render] App rendu");
  return moInstance.render(<Workbench />);
};

export default App;
