import React from "react";
import type { NodeType, LinkType } from "../types/graph";

interface InfoPanelProps {
  selectedNode: NodeType | null;
  selectedLink: LinkType | null;
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ selectedNode, selectedLink, onClose }) => {
  if (!selectedNode && !selectedLink) return null;

  const source = selectedLink?.source as NodeType;
  const target = selectedLink?.target as NodeType;

  return (
    <div className="absolute right-0 top-0 h-full w-80 bg-gray-800 text-white p-4 overflow-y-auto shadow-lg z-50">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-300 hover:text-white text-xl"
      >
        &times;
      </button>

      {selectedNode && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Nœud sélectionné</h2>
          <p><span className="font-bold">ID:</span> {selectedNode.id}</p>
          <p><span className="font-bold">Label:</span> {selectedNode.label}</p>
          <p><span className="font-bold">Type:</span> {selectedNode.type}</p>
          <p><span className="font-bold">Niveau:</span> {selectedNode.level}</p>
        </div>
      )}

      {selectedLink && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Lien sélectionné</h2>
          <p><span className="font-bold">ID:</span> {selectedLink.id}</p>
          <p><span className="font-bold">Source:</span> {source?.label} ({source?.id})</p>
          <p><span className="font-bold">Cible:</span> {target?.label} ({target?.id})</p>
          <p><span className="font-bold">Type:</span> {selectedLink.type}</p>
        </div>
      )}
    </div>
  );
};

export default InfoPanel;
