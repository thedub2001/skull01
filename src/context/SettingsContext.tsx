// src/context/SettingsContext.tsx
import React, { createContext, useState, useContext } from "react";

interface SettingsContextType {
  hueStep: number;
  setHueStep: (value: number) => void;
  showLabels: boolean;
  setShowLabels: (value: boolean) => void;
  linkTypeFilter: string[];
  setLinkTypeFilter: (value: string[]) => void;
  availableLinkTypes: string[];
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hueStep, setHueStep] = useState(47); // valeur par défaut
  const [showLabels, setShowLabels] = useState(true);
  const [linkTypeFilter, setLinkTypeFilter] = useState<string[]>([]);

  // Liste des types de liens disponibles (peut être dynamique plus tard)
  const availableLinkTypes = ["hiérarchique", "amical", "professionnel", "philosophique"];

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
