// app/components/auxiliarybar/GraphWrapper.tsx
import React, { useEffect, useMemo } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { useVisualLinksRenderer } from "../../hooks/useVisualLinksRenderer";
import { useMoleculeSettings } from "../../hooks/useMoleculeSettings";
import type { NodeType, LinkType, VisualLinkType } from "../../types/types";
import type { ForceGraphMethods } from "react-force-graph-3d";
import { levelToColor } from "../../utils/color";
import type { JSX } from 'react';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


interface Props {
  fgRef: React.MutableRefObject<ForceGraphMethods<NodeType, LinkType> | null>;
  width: number;
  height: number;
  graphData: { nodes: NodeType[]; links: LinkType[] };
  selectedNodes: Set<string>;
  selectedLinks: Set<string>;
  setSelectedLinks: React.Dispatch<React.SetStateAction<Set<string>>>;
  getLinkId: (link: LinkType) => string;
  nodeThreeObject: any;
  onNodeClick: (node: NodeType) => void;
  onLinkClick: (link: LinkType) => void;
  visualLinks: VisualLinkType[];
}

export default function GraphWrapper(
  {
  fgRef,
  width,
  height,
  graphData,
  selectedNodes,
  selectedLinks,
  setSelectedLinks,
  getLinkId,
  nodeThreeObject,
  onNodeClick,
  onLinkClick,
  visualLinks,
}: Props) : JSX.Element  {
  console.log("[GraphWrapper] Initialisation");

  const { hueStep, showLabels, linkTypeFilter } = useMoleculeSettings();
  

  // --- Visual links rendering ---
  useVisualLinksRenderer({
    fgRef,
    graphData,
    visualLinks,
    selectedLinks,
    setSelectedLinks,
    getLinkId,
  });

  // --- ⚡ Reglage du zoom (moins sensible) ---
  useEffect(() => {
    if (fgRef.current) {
      // on caste l'objet en OrbitControls
      const controls = fgRef.current.controls() as OrbitControls | undefined;
      if (controls) {
        controls.zoomSpeed = 0.5; // ← plus lent
        console.log("[GraphWrapper] Zoom speed réglé sur", controls.zoomSpeed);
      }
    }
  }, [fgRef]);

  // --- Couleurs des nœuds ---
  const nodeColors = useMemo(() => {
    console.log("[GraphWrapper] Recalcul couleurs, hueStep:", hueStep);
    return graphData.nodes.reduce((acc, node) => {
      acc[node.id] = levelToColor(node.level ?? 0, hueStep);
      return acc;
    }, {} as Record<string, string>);
  }, [graphData.nodes, hueStep]);

  // --- Filtrage des liens selon linkTypeFilter ---
  const filteredLinkColor = (link: LinkType) => {
    if (!linkTypeFilter.length || linkTypeFilter.includes(link.type)) {
      return selectedLinks.has(getLinkId(link)) ? "orange" : "#aaa";
    }
    return "rgba(0,0,0,0)"; // lien invisible
  };

  // --- Choix d'affichage des labels ---
  const nodeThreeObjectWithLabel = (node: NodeType) => {
    if (!showLabels) return null;

    // Récupération du ThreeObject fourni
    const obj = nodeThreeObject(node);
    if (!obj) return null;

    // 🔹 Clonage du matériau pour éviter le glitch sur labels identiques
    if ("material" in obj) {
      // Si c'est un SpriteText ou un Mesh, clone le material
      obj.material = obj.material.clone();
    }

    return obj;
  };

  console.log("[GraphWrapper] width", width);
  console.log("[GraphWrapper] height", height);

  return (
    <ForceGraph3D
      ref={fgRef}
            width={width}    // ← important
      height={height}  // ← important
      graphData={graphData}
      backgroundColor="#222"
      linkWidth={(link) => (selectedLinks.has(getLinkId(link)) ? 6 : 2)}
      linkOpacity={1}
      nodeThreeObject={nodeThreeObjectWithLabel}
      nodeThreeObjectExtend
      nodeColor={(node: NodeType) =>
        selectedNodes.has(node.id) ? "orange" : nodeColors[node.id]
      }
      onNodeClick={onNodeClick}
      linkColor={filteredLinkColor}
      onLinkClick={onLinkClick}
    />
  );
}
