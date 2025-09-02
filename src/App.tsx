// App.tsx

import { IExtensionService } from '@dtinsight/molecule/esm/services';
import "@dtinsight/molecule/esm/style/mo.css";
// App.tsx
import React from "react";
import { create, Workbench } from "@dtinsight/molecule";
import type { IExtension, IPanelItem } from "@dtinsight/molecule/esm/model"; // même source
import "@dtinsight/molecule/esm/style/mo.css";
import GraphApp from "./GraphApp";

const panel: IPanelItem = {
  id: "graph.panel",
  name: "Graph Panel",
  title: "Graph Panel",
  renderPane: () => {
    console.log("[molecule][panel] rendering GraphApp");
    return <GraphApp />;
  },
};

const GraphExtension: IExtension = {
  id: "graph.extension",
  name: "Graph Extension",
  activate() {
    console.log("[molecule][activate] GraphExtension activated");
    import("@dtinsight/molecule").then(({ molecule }) => {
      molecule.panel.add(panel);
      molecule.panel.setActive(panel.id);
    });
  },
  dispose() {
    console.log("[molecule][dispose] GraphExtension disposed");
    import("@dtinsight/molecule").then(({ molecule }) => {
      molecule.panel.remove(panel.id);
    });
  },
};

const moInstance = create({
  extensions: [GraphExtension],
});
console.log("[molecule][init] create done");

export default function App() {
  console.log("[molecule][render] App rendered");
  return moInstance.render(<Workbench />);
}
