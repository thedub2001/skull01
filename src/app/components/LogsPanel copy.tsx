// components/LogsPanel.tsx
import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

const LogsPanel: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const clearLogs = () => setLogs([]);

  // Définir le thème custom noir avec couleurs pour les logs
  useEffect(() => {
    monaco.editor.defineTheme("custom-logs", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "log", foreground: "00ff00" },
        { token: "warn", foreground: "ffff00" },
        { token: "error", foreground: "ff0000" },
      ],
      colors: {
        "editor.background": "#000000", // fond noir
      },
    });
  }, []);

  // Hijack console pour intercepter logs
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

  // Scroll automatique vers la dernière ligne
  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        editorRef.current.revealLine(model.getLineCount());
      }
    }
  }, [logs]);

const handleEditorMount: OnMount = editor => {
  editorRef.current = editor;

  // Observer le container du panel pour forcer le thème quand il devient visible
  const container = editor.getDomNode()?.parentElement;
  if (container) {
    const observer = new MutationObserver(() => {
      const style = getComputedStyle(container);
      if (style.display !== "none") {
        monaco.editor.setTheme("custom-logs");
        editor.updateOptions({});
      }
    });
    observer.observe(container, { attributes: true, attributeFilter: ["style"] });
  }
};

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "4px", borderBottom: "1px solid #ccc" }}>
        <button onClick={clearLogs}>Clear Logs</button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={logs.join("\n")}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
          }}
          theme="custom-logs"
          onMount={handleEditorMount}
        />
      </div>
    </div>
  );
};

export default LogsPanel;
