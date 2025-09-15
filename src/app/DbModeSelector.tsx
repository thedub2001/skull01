// src/app/DbModeSelector.tsx
import type { DbMode } from "./types/types";

const DEBUG_MODE = true;
function log(...args: any[]) {
  if (!DEBUG_MODE) return;
  console.log("[dbmode]", ...args);
}

export type DbModeSelectorProps = {
  activeMode: DbMode;
  onChangeMode: (mode: DbMode) => void;
};

/**
 * DbModeSelector
 * Composant qui affiche les options de DB Mode (local, remote, sync)
 * et notifie le parent du changement via onChangeMode.
 */
export default function DbModeSelector({ activeMode, onChangeMode }: DbModeSelectorProps) {
  const modes: DbMode[] = ["local", "remote", "sync"];

  return (
    <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {modes.map((db) => (
        <label
          key={db}
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "6px",
            borderRadius: "4px",
            background: activeMode === db ? "#2563eb" : "transparent",
            color: activeMode === db ? "#fff" : "#ccc",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <input
              type="radio"
              name="dbMode"
              checked={activeMode === db}
              onChange={() => {
                log("[click] change mode", db);
                onChangeMode(db);
              }}
            />
            <span>{db}</span>
          </div>
        </label>
      ))}
    </div>
  );
}
