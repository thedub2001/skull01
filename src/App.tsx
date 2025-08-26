import React, { useEffect, useRef, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import InfoPanel from "./components/InfoPanel";
import useLabelSprite from "./components/LabelSprite";
import useCameraTracker from "./hooks/useCameraTracker";
import { addDynamicVisualLinks, updateVisualLinks } from "./utils/addDynamicVisualLinks";
import { useNodes } from "./hooks/useNodes";
import { useLinks } from "./hooks/useLinks";
import { useGraphSelection } from "./hooks/useGraphSelection";

import type { NodeType, LinkType } from "./types/graph";
import { useVisualLinks } from "./hooks/useVisualLinks";
import type { VisualLinkType } from "./types/VisualLinkType";

const levelToColor = (level: number): string => {
  const baseHue = 60;
  const hueStep = 47;
  const hue = (baseHue + level * hueStep) % 360;
  const saturation = 80;
  const lightness = level % 2 === 0 ? 45 : 65;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

function App() {
  const fgRef = useRef<any>(null);

  // --- Hooks ---
  const { nodes, fetchGraphData, addNode, deleteNode } = useNodes();
  const { links, fetchLinks, addLink, deleteLink } = useLinks();
  const { visualLinks, fetchVisualLinks } = useVisualLinks();
  const {
    selectedNodes,
    selectedLinks,
    setSelectedNodes,
    setSelectedLinks,
    getLinkId,
    onNodeClick,
    onLinkClick,
  } = useGraphSelection();


  const cameraPos = useCameraTracker(fgRef);
  const nodeThreeObject = useLabelSprite({ cameraPos, generateTextLabel });

  // --- Helpers ---

  function generateTextLabel(text: string): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const fontSize = 64;

    ctx.font = `${fontSize}px Sans-Serif`;
    const width = ctx.measureText(text).width;

    canvas.width = width;
    canvas.height = fontSize;

    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.fillStyle = "white";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 0, fontSize / 2);

    return canvas;
  }

  // --- Fetch initial data ---
  useEffect(() => {
    (async () => {
      console.log("[graph][fetch] Initial fetch nodes & links");
      await fetchGraphData();
      await fetchLinks();
      await fetchVisualLinks();
    })();
  }, [fetchGraphData, fetchLinks, fetchVisualLinks]);

  // --- Visual links rendering ---
  useEffect(() => {
    if (!fgRef.current || visualLinks.length === 0) return;

    setTimeout(() => {
      if (!fgRef.current) return;
      addDynamicVisualLinks(
        fgRef.current,
        visualLinks,
        { nodes },
        () => selectedLinks,
        (linkId) => {
          setSelectedLinks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(linkId)) newSet.delete(linkId);
            else newSet.add(linkId);
            console.log("[graph][selectVisualLink]", Array.from(newSet));
            return newSet;
          });
        }
      );
    }, 50);
  }, [visualLinks]);

  useEffect(() => {
    let frameId: number;

    const animate = () => {
      if (fgRef.current) updateVisualLinks(fgRef.current, { nodes, links });
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(frameId);
  }, [nodes, links]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ForceGraph3D
        ref={fgRef}
        graphData={{ nodes, links }}
        backgroundColor="#222"
        linkWidth={(link) => selectedLinks.has(getLinkId(link as LinkType)) ? 6 : 2}
        linkOpacity={1}
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend
        nodeColor={(node) =>
          selectedNodes.has((node as NodeType).id)
            ? "orange"
            : levelToColor((node as NodeType).level ?? 0)
        }
        onNodeClick={onNodeClick}
        linkColor={(link) => selectedLinks.has(getLinkId(link as LinkType)) ? "orange" : "#aaa"}
        onLinkClick={onLinkClick}
      />

      <InfoPanel
        selectedNodes={nodes.filter(n => selectedNodes.has(n.id))}
        selectedLinks={links.filter(l => selectedLinks.has(getLinkId(l)))}
        nodes={nodes}
        links={links}
        onClose={() => {
          setSelectedNodes(new Set());
          setSelectedLinks(new Set());
          console.log("[graph][infoPanel] Closed");
        }}
        onCreateChildNode={async (parentId) => {
          console.log("[graph][addChildNode] parentId:", parentId);
        
          // Chercher le parent dans les nodes
          const parentNode = nodes.find((n) => n.id === parentId);
          if (!parentNode) {
            console.error("[graph][addChildNode] parent node not found:", parentId);
            return;
          }
        
          console.log("[graph][addChildNode] parent label:", parentNode.label);
        
          // Nouveau nœud avec un label basé sur le parent
          const newNode = await addNode(`Enfant de ${parentNode.label}`, "child");
          if (!newNode) return;
        
          // Création du lien parent-enfant
          await addLink(parentId, newNode.id, "parent-child");
        }}
        
        onDeleteNode={async (nodeId) => {
          console.log("[graph][deleteNode]", nodeId);

          // Supprime les liens associés d’abord
          const relatedLinks = links.filter(l => l.source === nodeId || l.target === nodeId);
          for (const l of relatedLinks) {
            await deleteLink(l.id);
          }

          // Supprime le nœud
          await deleteNode(nodeId);
        }}
      />
    </div>
  );
}

export default App;
