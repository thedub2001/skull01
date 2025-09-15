// src/app/hooks/useMeshExplorerSettings.ts
import { useState, useEffect, useCallback } from "react";
import molecule from "@dtinsight/molecule";
import type { DbMode } from "./types/types";

const DEBUG_MODE = true;
function log(...args: any[]) {
  if (!DEBUG_MODE) return;
  console.log("[settings]", ...args);
}

export type ActiveDataset = { id: string; source: DbMode } | null;

/**
 * Hook qui encapsule la gestion des settings du Mesh Explorer
 *  - dbMode
 *  - dataset
 *  - handleDbModeChange
 *  - handleDatasetChange
 */
export function useMeshExplorerSettings() {
  const [activeMode, setActiveMode] = useState<DbMode>("local");
  const [activeDataset, setActiveDataset] = useState<ActiveDataset>(null);

  // Load initial settings
  useEffect(() => {
    const settings = molecule.settings.getSettings();
    const cfgMode = (settings as any).dbMode || "local";
    const cfgDataset = (settings as any).dataset || null;

    log("[data] initial settings", { cfgMode, cfgDataset });

    setActiveMode(cfgMode);
    setActiveDataset(cfgDataset);

    const unsubscribe = molecule.settings.onChangeSettings((newSettings) => {
      log("[data] settings changed", newSettings);
      if ((newSettings as any).dbMode) setActiveMode((newSettings as any).dbMode);
      if ((newSettings as any).dataset) setActiveDataset((newSettings as any).dataset);
    });

    return () => {
      try {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      } catch (err) {
        log("[settings] unsubscribe error (ignored)", err);
      }
    };
  }, []);

  const handleDbModeChange = useCallback((mode: DbMode) => {
    log("[click] change db mode", mode);
    setActiveMode(mode);
    molecule.settings.update({ dbMode: mode });
  }, []);

  const handleDatasetChange = useCallback((id: string, source: DbMode) => {
    log("[click] select dataset", { id, source });
    setActiveDataset({ id, source });
    molecule.settings.update({ dataset: id });
  }, []);

  return {
    activeMode,
    activeDataset,
    handleDbModeChange,
    handleDatasetChange,
  };
}
