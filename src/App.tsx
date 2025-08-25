import React, { useEffect, useRef, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { fetchGraphData, fetchVisualLinks } from "./lib/db";
import InfoPanel from "./components/InfoPanel";
import useLabelSprite from "./components/LabelSprite";
import useCameraTracker from "./hooks/useCameraTracker";
import {
  addDynamicVisualLinks,
  updateVisualLinks,
} from "./utils/addDynamicVisualLinks";
import { supabase } from "./lib/supabase";
import { v4 as uuidv4 } from "uuid"; // Importation pour générer des UUID

import type { NodeType, LinkType } from "./types/graph";
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
  const [graphData, setGraphData] = useState<{
    nodes: NodeType[];
    links: LinkType[];
  }>({ nodes: [], links: [] });
  const [visualLinks, setVisualLinks] = useState<VisualLinkType[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());

  const fgRef = useRef<any>(null);

  const getLinkId = (l: LinkType): string =>
    `${
      typeof l.source === "object" ? l.source.id : l.source
    }|${typeof l.target === "object" ? l.target.id : l.target}`;

  const generateTextLabel = (text: string): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    const fontSize = 64;

    context.font = `${fontSize}px Sans-Serif`;
    const textWidth = context.measureText(text).width;

    canvas.width = textWidth;
    canvas.height = fontSize;

    context.font = `${fontSize}px Sans-Serif`;
    context.fillStyle = "white";
    context.textBaseline = "middle";
    context.fillText(text, 0, fontSize / 2);

    return canvas;
  };

  const createChildNode = async (nodeId: string) => {
    const parentNode = graphData.nodes.find((n) => n.id === nodeId);
    if (!parentNode) {
      console.error(`[CREATE_CHILD_NODE] Node with ID ${nodeId} not found`);
      return;
    }

    // Création d'un nouveau nœud enfant avec UUID valide
    const newNode: NodeType = {
      id: uuidv4(), // Génère un UUID valide
      label: `Enfant de ${parentNode.label}`,
      type: "child",
      level: (parentNode.level ?? 0) + 1,
    };

    const newLink: LinkType = {
      id: uuidv4(), // Génère un UUID valide
      source: parentNode.id,
      target: newNode.id,
      type: "parent-child",
    };

    console.log(`[CREATE_CHILD_NODE] New node to insert:`, newNode);
    console.log(`[CREATE_CHILD_NODE] New link to insert:`, newLink);

    // Mise à jour locale
    setGraphData((prev) => ({
      nodes: [...prev.nodes, newNode],
      links: [...prev.links, newLink],
    }));

    // Mise à jour dans la base de données
    try {
      const nodeResponse = await supabase.from("nodes").insert(newNode);
      console.log("[CREATE_CHILD_NODE] Node insert response:", nodeResponse);

      const linkResponse = await supabase.from("links").insert(newLink);
      console.log("[CREATE_CHILD_NODE] Link insert response:", linkResponse);

      if (nodeResponse.error || linkResponse.error) {
        console.error(
          "[CREATE_CHILD_NODE] Error inserting into the database:",
          nodeResponse.error || linkResponse.error
        );
      } else {
        console.log("[CREATE_CHILD_NODE] Child node successfully added to the database");
      }
    } catch (error) {
      console.error("[CREATE_CHILD_NODE] Unexpected error:", error);
    }
  };

  const deleteNode = async (nodeId: string) => {
    console.log(`[DELETE_NODE] Deleting node with ID: ${nodeId}`);
    setGraphData((prev) => {
      const nodes = prev.nodes.filter((n) => n.id !== nodeId);
      const links = prev.links.filter(
        (l) => l.source !== nodeId && l.target !== nodeId
      );
      return { nodes, links };
    });

    console.log(`[DELETE_NODE] Node with ID ${nodeId} deleted locally`);
  };


  useEffect(() => {
    (async () => {
      const data = await fetchGraphData();
      const cleanedNodes = data.nodes.filter((n) => n && n.id !== undefined);
      const cleanedLinks = data.links
        .filter(
          (l) =>
            l &&
            ((typeof l.source === "string" &&
              cleanedNodes.find((n) => n.id === l.source)) ||
              (typeof l.source === "object" &&
                l.source?.id &&
                cleanedNodes.find((n) => n.id === l.source.id))) &&
            ((typeof l.target === "string" &&
              cleanedNodes.find((n) => n.id === l.target)) ||
              (typeof l.target === "object" &&
                l.target?.id &&
                cleanedNodes.find((n) => n.id === l.target.id)))
        )
        .map((l) => ({
          ...l,
          source: typeof l.source === "object" ? l.source.id : l.source,
          target: typeof l.target === "object" ? l.target.id : l.target,
        }));

      setGraphData({ nodes: cleanedNodes, links: cleanedLinks });

      const vLinksRaw = await fetchVisualLinks();
      const filteredVisualLinks = vLinksRaw.filter(
        (vl) =>
          cleanedNodes.find((n) => n.id === vl.source_id) &&
          cleanedNodes.find((n) => n.id === vl.target_id)
      );
      setVisualLinks(filteredVisualLinks);
    })();
  }, []);

  const cameraPos = useCameraTracker(fgRef);
  const nodeThreeObject = useLabelSprite({ cameraPos, generateTextLabel });

  const onVisualLinkClick = (linkId: string) => {
    setSelectedLinks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(linkId)) newSet.delete(linkId);
      else newSet.add(linkId);
      return newSet;
    });
  };

  useEffect(() => {
    if (!fgRef.current || visualLinks.length === 0) return;

    setTimeout(() => {
      if (!fgRef.current) return;
      addDynamicVisualLinks(
        fgRef.current,
        visualLinks,
        graphData,
        () => selectedLinks,
        onVisualLinkClick
      );
    }, 50);
  }, [visualLinks, selectedLinks, graphData]);

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      if (fgRef.current) updateVisualLinks(fgRef.current, graphData);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [graphData]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        backgroundColor="#222"
        linkWidth={(link) =>
          selectedLinks.has(getLinkId(link as LinkType)) ? 6 : 2
        }
        linkOpacity={1}
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend
        nodeColor={(node) =>
          selectedNodes.has((node as NodeType).id)
            ? "orange"
            : levelToColor((node as NodeType).level ?? 0)
        }
        onNodeClick={(node) => {
          const nodeId = (node as NodeType).id;
          setSelectedNodes((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) newSet.delete(nodeId);
            else newSet.add(nodeId);
            return newSet;
          });
        }}
        linkColor={(link) =>
          selectedLinks.has(getLinkId(link as LinkType)) ? "orange" : "#aaa"
        }
        onLinkClick={(link) => {
          const id = getLinkId(link as LinkType);
          setSelectedLinks((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
          });
        }}
      />

      <InfoPanel
        selectedNodes={graphData.nodes.filter((n) =>
          selectedNodes.has(n.id)
        )}
        selectedLinks={graphData.links.filter((l) =>
          selectedLinks.has(getLinkId(l))
        )}
        nodes={graphData.nodes}
        links={graphData.links}
        onClose={() => {
          setSelectedNodes(new Set());
          setSelectedLinks(new Set());
        }}
        onCreateChildNode={createChildNode}
        onDeleteNode={deleteNode}
      />
    </div>
  );
}

export default App;