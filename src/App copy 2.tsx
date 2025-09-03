// App.tsx
import React from "react";
import { create, Workbench } from "@dtinsight/molecule";
import type { IExtension } from "@dtinsight/molecule/esm/model";
import "@dtinsight/molecule/esm/style/mo.css";

const TestExtension: IExtension = {
  id: "test.extension",
  name: "Test Extension",
  activate() {
    console.log("[molecule][activate] TestExtension activée !");
  },
  dispose() {
    console.log("[molecule][dispose] TestExtension supprimée");
  },
};

const moInstance = create({
  extensions: [TestExtension],
});

console.log("[molecule][init] create done");

export default function App() {
  console.log("[molecule][render] App rendu");
  return moInstance.render(<Workbench />);
}
