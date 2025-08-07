import React, { useEffect, useRef, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';

import { fetchGraphData } from './lib/db';
import InfoPanel from './components/InfoPanel';
import useLabelSprite from './components/LabelSprite';

import type { NodeType, LinkType } from './types/graph';

/**
 * Utilitaire pour convertir un niveau hiérarchique en couleur HSL.
 */
function levelToColor(level: number): string {
  const baseHue = 60;
  const hueStep = 47;
  const hue = (baseHue + level * hueStep) % 360;
  const saturation = 80;
  const lightness = level % 2 === 0 ? 45 : 65;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Fonction principale de l'application.
 * Gère l'état, les données du graphe et le rendu 3D.
 */
function App() {
  // État des données du graphe (noeuds et liens)
  const [graphData, setGraphData] = useState<{ nodes: NodeType[], links: LinkType[] }>({ nodes: [], links: [] });

  // États des sélections actuelles
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());

  // Référence vers le composant ForceGraph3D
  const fgRef = useRef<any>(null);

  // Fonction utilitaire pour générer l'ID unique d'un lien
  const getLinkId = (l: LinkType) =>
    `${typeof l.source === 'object' ? l.source.id : l.source}|${typeof l.target === 'object' ? l.target.id : l.target}`;

  /**
   * Génère dynamiquement un label en canvas pour affichage dans la scène 3D.
   */
  function generateTextLabel(text: string): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    const fontSize = 64;

    context.font = `${fontSize}px Sans-Serif`;
    const textWidth = context.measureText(text).width;

    canvas.width = textWidth;
    canvas.height = fontSize;

    context.font = `${fontSize}px Sans-Serif`;
    context.fillStyle = 'white';
    context.textBaseline = 'middle';
    context.fillText(text, 0, fontSize / 2);

    return canvas;
  }

  // Indique si les données sont prêtes à être affichées
  const [ready, setReady] = useState(false);

  // Chargement initial des données depuis la BDD
  useEffect(() => {
    async function loadData() {
      const data = await fetchGraphData();
      setGraphData(data);
      setReady(true);
    }
    loadData();
  }, []);

  // État de la position actuelle de la caméra
  const [cameraPos, setCameraPos] = useState({ x: 0, y: 0, z: 0 });

  // Met à jour la position de la caméra en continu pour adapter les labels
  useEffect(() => {
    if (!ready || !fgRef.current) return;

    let animationFrameId: number;
    const fg = fgRef.current;

    const tick = () => {
      const camPos = fg.cameraPosition();
      setCameraPos({ x: camPos.x, y: camPos.y, z: camPos.z });
      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [ready]);

  // Fonction fournie par le hook personnalisé, qui génère dynamiquement le label 3D du nœud
  const nodeThreeObject = useLabelSprite({ cameraPos, generateTextLabel });

  // ---- Rendu principal ----
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        backgroundColor="#222222"

        // Épaisseur dynamique des liens selon sélection
        linkWidth={(link) => {
          const linkId = getLinkId(link as LinkType);
          return selectedLinks.has(linkId) ? 6 : 2;
        }}

        linkOpacity={1}
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={true}

        // Couleur dynamique des nœuds
        nodeColor={(node) => {
          const n = node as NodeType;
          return selectedNodes.has(n.id)
            ? 'orange'
            : levelToColor(n.level ?? 0);
        }}

        // Sélection / désélection des nœuds
        onNodeClick={(node) => {
          const nodeId = (node as NodeType).id;
          setSelectedNodes(prev => {
            const newSet = new Set(prev);
            newSet.has(nodeId) ? newSet.delete(nodeId) : newSet.add(nodeId);
            return newSet;
          });
        }}

        // Couleur dynamique des liens
        linkColor={(link) => {
          const id = getLinkId(link as LinkType);
          return selectedLinks.has(id) ? 'orange' : '#aaa';
        }}

        // Sélection / désélection des liens
        onLinkClick={(link) => {
          const id = getLinkId(link as LinkType);
          setSelectedLinks(prev => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
          });
        }}
      />

      {/* Panneau d'information latéral */}
      <InfoPanel
        selectedNodes={graphData.nodes.filter(node => selectedNodes.has(node.id))}
        selectedLinks={graphData.links.filter(link => selectedLinks.has(getLinkId(link)))}
        nodes={graphData.nodes}
        links={graphData.links}
        onClose={() => {
          setSelectedNodes(new Set());
          setSelectedLinks(new Set());
        }}
      />
    </div>
  );
}

export default App;
