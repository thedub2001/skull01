import React from "react";
import type { NodeType, LinkType } from "../types/graph";

interface InfoPanelProps {
  selectedNodes: NodeType[];
  selectedLinks: LinkType[];
  links: LinkType[];
  nodes: NodeType[];
  onClose: () => void;
  onCreateChildNode?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  selectedNodes,
  selectedLinks,
  nodes,
  links,
  onClose,
  onCreateChildNode,
  onDeleteNode,
}) => {
  if (selectedNodes.length === 0 && selectedLinks.length === 0) return null;

  console.log("== Debug InfoPanel ==");
  console.log("selectedLinks:", selectedLinks);

  return (
    <div className="absolute right-0 top-0 h-full w-80 bg-gray-800 text-white p-4 overflow-y-auto shadow-lg z-50">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-300 hover:text-white text-xl"
      >
        &times;
      </button>

      {selectedNodes.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Nœuds sélectionnés</h2>
          {selectedNodes.map((node) => (
            <div key={node.id} className="mb-4 border-b border-gray-600 pb-2">
              <p>
                <span className="font-bold">ID:</span> {node.id}
              </p>
              <p>
                <span className="font-bold">Label:</span> {node.label}
              </p>
              <p>
                <span className="font-bold">Type:</span> {node.type}
              </p>
              <p>
                <span className="font-bold">Niveau:</span> {node.level}
              </p>
              <div className="flex gap-2 mt-2">
                {onCreateChildNode && (
                  <button
                    onClick={() => onCreateChildNode(node.id)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Créer un nœud enfant
                  </button>
                )}
                {onDeleteNode && (
                  <button
                    onClick={() => onDeleteNode(node.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Supprimer le nœud
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedLinks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Liens sélectionnés</h2>
          {selectedLinks.map((link) => {
            const source =
              typeof link.source === "string"
                ? nodes.find((n) => n.id === link.source)
                : (link.source as NodeType);

            const target =
              typeof link.target === "string"
                ? nodes.find((n) => n.id === link.target)
                : (link.target as NodeType);

            return (
              <div
                key={link.id}
                className="mb-4 border-b border-gray-600 pb-2"
              >
                <p>
                  <span className="font-bold">ID:</span> {link.id}
                </p>
                <p>
                  <span className="font-bold">Source:</span> {source?.label} (
                  {source?.id})
                </p>
                <p>
                  <span className="font-bold">Cible:</span> {target?.label} (
                  {target?.id})
                </p>
                <p>
                  <span className="font-bold">Type:</span> {link.type}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InfoPanel;