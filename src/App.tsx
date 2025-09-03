// App.tsx

import type { IExtension } from "@dtinsight/molecule/esm/model";
import "@dtinsight/molecule/esm/style/mo.css";
import GraphApp from "./GraphApp";
import React from "react";
import { create, Workbench, molecule } from "@dtinsight/molecule";
import type { IExtensionService } from "@dtinsight/molecule/esm/services";

import { SettingsProvider } from "./context/SettingsContext"; // ← ton provider
import Editor, { loader } from "@monaco-editor/react";
import * as monaco from 'monaco-editor'

console.log("[molecule][init] starting App.tsx");

// --- Logs Panel component ---
const LogsPanel: React.FC = () => {
  const [logs, setLogs] = React.useState<string[]>([]);

  const clearLogs = () => setLogs([]);

  React.useEffect(() => {

    monaco.editor.defineTheme("custom", {
      base: "vs-dark",
      inherit: true,
      rules: [{ token: "log", foreground: "00ff00" }],
      colors: {}
    });

    const origLog = console.log;
    const origErr = console.error;
    const origWarn = console.warn;

    console.log = (...args) => {
      setLogs(prev => [...prev, `[log] ${args.map(String).join(" ")}`]);
      origLog(...args);
    };

    console.error = (...args) => {
      setLogs(prev => [...prev, `[error] ${args.map(String).join(" ")}`]);
      origErr(...args);
    };

    console.warn = (...args) => {
      setLogs(prev => [...prev, `[warn] ${args.map(String).join(" ")}`]);
      origWarn(...args);
    };

    return () => {
      console.log = origLog;
      console.error = origErr;
      console.warn = origWarn;
    };
  }, []);

  return (
<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
  <div style={{ padding: "4px", borderBottom: "1px solid #ccc" }}>
    <button onClick={clearLogs}>Clear Logs</button>
  </div>
  <div style={{ flex: 1, minHeight: 0 }}> {/* minHeight:0 permet à flex de calculer correctement */}
    <Editor
      height="100%"          // obligatoire
      defaultLanguage="javascript"
      value={logs.join("\n")}
      options={{ readOnly: true, minimap: { enabled: false } }}
      theme="vs-dark"
    />
  </div>
</div>
  );
};

// --- Extension Molecule ---
const GraphExtension: IExtension = {
  id: "graph.extension",
  name: "Graph Extension",
  activate(extensionCtx: IExtensionService) {
    console.log("[molecule][activate] GraphExtension activée");

    // Ouvre GraphApp comme éditeur central
    molecule.editor.open({
      id: "graph.editor",
      name: "Graph Editor",
      renderPane: () => {
        console.log("[molecule][render] GraphEditor rendu");
        return <GraphApp />;
      },
      closable: false,
    });

    // Ajoute le Logs Panel en bas
    molecule.panel.add({
      id: "logs.panel",
      name: "Logs Panel",
      renderPane: () => <LogsPanel />,
    });
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
  return (
    <SettingsProvider links={[]}>
      {moInstance.render(<Workbench />)}
    </SettingsProvider>
  );
};

export default App;
