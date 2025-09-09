// components/LogsPanel.tsx
import React, { useEffect, useState } from "react";
import { molecule } from "@dtinsight/molecule";

const LogsPanel: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);

  // Hijack console pour capturer les logs
  useEffect(() => {
    const origLog = console.log;
    const origWarn = console.warn;
    const origErr = console.error;

    console.log = (...args) => {
      setLogs(prev => [...prev, `[log] ${args.map(String).join(" ")}`]);
      origLog(...args);
    };
    console.warn = (...args) => {
      setLogs(prev => [...prev, `[warn] ${args.map(String).join(" ")}`]);
      origWarn(...args);
    };
    console.error = (...args) => {
      setLogs(prev => [...prev, `[error] ${args.map(String).join(" ")}`]);
      origErr(...args);
    };

    return () => {
      console.log = origLog;
      console.warn = origWarn;
      console.error = origErr;
    };
  }, []);

  // Ajouter le panel via IPanelService
  useEffect(() => {
    const panelService = molecule.panel; // IPanelService
    const panelId = "logs.panel";

    // Ajouter le panel
    panelService.add({
      id: panelId,
      name: "Logs Panel",
      renderPane: () => (
        <div
          style={{
            backgroundColor: "#000",
            color: "#0f0",
            padding: "4px",
            fontFamily: "monospace",
            fontSize: "12px",
            overflowY: "auto",
            height: "100%",
          }}
        >
          {logs.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      ),
    });

    // Activer le panel
    panelService.setActive(panelId);
  }, [logs]);

  return null; // Le rendu se fait via le panel Molecule
};

export default LogsPanel;
