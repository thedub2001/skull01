// hooks/useMoleculeSettings.ts
import { useEffect, useState } from "react";
import molecule from "@dtinsight/molecule";
import type { ISettings } from "@dtinsight/molecule/esm/model";

/**
 * Hook React pour accéder aux settings Molecule
 * et rerender automatiquement quand ils changent.
 */
export function useMoleculeSettings(): ISettings {
  const [settings, setSettings] = useState<ISettings>(
    molecule.settings.getSettings()
  );

  useEffect(() => {
    // Écoute les changements
    const dispose = molecule.settings.onChangeSettings((newSettings) => {
      setSettings(newSettings);
    });

    return () => {
      // Certains Molecule renvoient une fonction, d’autres un disposable
      if (typeof dispose === "function") {
        dispose();
      } else {
        dispose?.dispose?.();
      }
    };
  }, []);

  return settings;
}
