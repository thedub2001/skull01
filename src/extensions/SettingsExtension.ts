// extensions/SettingsExtension.ts
import molecule from '@dtinsight/molecule';
import type { IExtension } from '@dtinsight/molecule/esm/model';
import type { IExtensionService } from '@dtinsight/molecule/esm/molecule.api';

// Clé localStorage
const STORAGE_KEY = "myApp.settings";

// Valeurs par défaut (à adapter selon ton projet)
const defaultSettings = {
  dbMode: "local",      // "local" | "remote" | "sync"
  hueStep: 30,
  showLabels: true,
  linkTypeFilter: [] as string[],
  user: "fab11111-1111-1111-1111-111111111111",
};

export class SettingsExtension implements IExtension {
  id = "ExtendSettings";
  name = "Extend Settings";

  activate(extensionCtx: IExtensionService): void {
    // 1. Charger settings depuis localStorage si dispo
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    const initialSettings = { ...defaultSettings, ...parsed };
    console.log("[SettingsExtension] defaultSettings : ", defaultSettings );
    console.log("[SettingsExtension] parsed : ", parsed );
    console.log("[SettingsExtension] initialSettings : ", initialSettings );

    // 2. Injecter dans Molecule
    molecule.settings.append(initialSettings);

    // 3. Écouter changements et sauvegarder
    molecule.settings.onChangeSettings((newSettings) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));

      const stored = localStorage.getItem(STORAGE_KEY);
      console.log("[SettingsExtension] Nouveaux ettings, contenu de", STORAGE_KEY, ":", stored);
    });
  }

  dispose(extensionCtx: IExtensionService): void {}
}
