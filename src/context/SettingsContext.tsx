// src/context/SettingsContext.tsx
import React, { createContext, useState, useContext, useMemo, useEffect } from "react";
import type { LinkType } from "../types/graph";
import { pushLocalToRemote, pullRemoteToLocal, initRealtimeSync } from "../db/sync";

export type DbMode = "local" | "remote" | "sync";

interface SettingsContextType {
  hueStep: number;
  setHueStep: (value: number) => void;
  showLabels: boolean;
  setShowLabels: (value: boolean) => void;
  linkTypeFilter: string[];
  setLinkTypeFilter: (value: string[]) => void;
  availableLinkTypes: string[];

  // --- Ajout pour DB ---
  dbMode: DbMode;
  setDbMode: (mode: DbMode) => void;
  pushLocalToRemote: () => Promise<void>;
  pullRemoteToLocal: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface ProviderProps {
  children: React.ReactNode;
  links: LinkType[];
}

export const SettingsProvider: React.FC<ProviderProps> = ({ children, links }) => {
  const [hueStep, setHueStep] = useState(47);
  const [showLabels, setShowLabels] = useState(true);
  const [linkTypeFilter, setLinkTypeFilter] = useState<string[]>([]);

  // --- Nouvel état pour dbMode ---
  const [dbMode, setDbMode] = useState<DbMode>("local");

  // Génération dynamique des types uniques à partir des liens
  const availableLinkTypes = useMemo(() => {
    const types = Array.from(
      new Set(
        links
          .map((link) => link.type)
          .filter((t): t is string => t != null && t !== "")
      )
    );
    return types;
  }, [links]);

  // Synchroniser le filtre avec les types disponibles (tout activé par défaut)
  useEffect(() => {
    if (availableLinkTypes.length > 0) {
      setLinkTypeFilter((prev) =>
        prev.length === 0 ? availableLinkTypes : prev.filter((t) => availableLinkTypes.includes(t))
      );
    }
  }, [availableLinkTypes]);

  // Gestion sync temps réel
  useEffect(() => {
    if (dbMode === "sync") {
      console.log("[SettingsContext] Sync mode activé → initRealtimeSync");
      initRealtimeSync();
    }
  }, [dbMode]);

  return (
    <SettingsContext.Provider
      value={{
        hueStep,
        setHueStep,
        showLabels,
        setShowLabels,
        linkTypeFilter,
        setLinkTypeFilter,
        availableLinkTypes,
        dbMode,
        setDbMode,
        pushLocalToRemote,
        pullRemoteToLocal,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};
