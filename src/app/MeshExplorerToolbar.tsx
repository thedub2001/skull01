// src/app/MeshExplorerToolbar.tsx
import { useCallback } from "react";
import molecule from "@dtinsight/molecule";

const Toolbar = molecule.component.Toolbar;

const DEBUG_MODE = true;
function log(...args: any[]) {
  if (!DEBUG_MODE) return;
  console.log("[toolbar]", ...args);
}

export type MeshExplorerToolbarProps = {
  onOpenEditorTab: () => void;
};

/**
 * MeshExplorerToolbar
 * Toolbar du header de Mesh Explorer.
 * Contient les boutons Reload et Show Mesh
 */
export default function MeshExplorerToolbar({ onOpenEditorTab }: MeshExplorerToolbarProps) {
  const handleClick = useCallback(
    (label: string) => {
      log("[click]", label);
      onOpenEditorTab();
    },
    [onOpenEditorTab]
  );

  return (
    <Toolbar
      data={[
        { icon: "refresh", id: "reload", title: "Reload", onClick: () => handleClick("reload") },
        { icon: "add", id: "showMesh", title: "Show Mesh", onClick: () => handleClick("showMesh") },
      ]}
    />
  );
}
