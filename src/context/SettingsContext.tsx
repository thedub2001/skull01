// src/context/SettingsContext.tsx
import React, { createContext, useState, useContext } from "react";

interface SettingsContextType {
  hueStep: number;
  setHueStep: (value: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hueStep, setHueStep] = useState(47); // valeur par défaut

  return (
    <SettingsContext.Provider value={{ hueStep, setHueStep }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};
