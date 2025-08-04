// Installation (dans ton terminal)
// npm install three 3d-force-graph

import React, { JSX, useEffect, useRef, useState } from 'react';
import ForceGraph3D from '3d-force-graph';
import { supabase } from './lib/supabase'


// Types
interface Node {
  id: string;
  label: string;
  level: number;
}

interface Link {
  source: string;
  target: string;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

const STORAGE_KEY = 'graph3d-network-data';

const initialData: GraphData = {
  nodes: [
    { id: 'root', label: 'Racine', level: 0 },
  ],
  links: []
};

function levelToColor(level: number): string {
  const baseHue = 60;
  const hueStep = 30;
  const hue = (baseHue + level * hueStep) % 360;
  const saturation = 80;
  const lightness = level % 2 === 0 ? 45 : 65;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}


export default function Graph3DApp(): JSX.Element {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Charger le graph au démarrage depuis localStorage, ou initialData sinon
  const [graphData, setGraphData] = useState<GraphData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as GraphData;
      } catch {
        return initialData;
      }
    }
    return initialData;
  });

  const [newNodeLabel, setNewNodeLabel] = useState<string>('');
  const [parentId, setParentId] = useState<string>('root');

  // Init force-graph une fois
  useEffect(() => {
    if (!containerRef.current) return;
    const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];
    const Graph = ForceGraph3D()(containerRef.current)
      .graphData(graphData)
      .nodeLabel((node: Node) => `${node.label}`)
      .nodeColor((node: Node) => levelToColor(node.level))
      .linkWidth(3)
      .backgroundColor('#333333')
      .onNodeClick((node: Node) => {
        setParentId(node.id);
      });
    fgRef.current = Graph;
  }, []);

  // Met à jour la vue quand graphData change
  useEffect(() => {
    if (fgRef.current) {
      // Clone simple pour éviter mutation côté force-graph
      const safeData = {
        nodes: graphData.nodes,
        links: graphData.links.map(link => ({ ...link }))
      };
      fgRef.current.graphData(safeData);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(graphData));
  }, [graphData]);

  const handleAddNode = (): void => {
    if (!newNodeLabel.trim()) return;
    const newId = `${Date.now()}`;
    const parent = graphData.nodes.find(n => n.id === parentId);
    const newLevel = (parent?.level ?? 0) + 1;

    const newNode: Node = { id: newId, label: newNodeLabel, level: newLevel };
    const newLink: Link = { source: parentId, target: newId };

    setGraphData(prev => ({
      nodes: [...prev.nodes, newNode],
      links: [...prev.links, newLink]
    }));

    setNewNodeLabel('');
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="p-4 bg-gray-100 flex items-center gap-2">
        <input
          className="border p-2 rounded w-64"
          placeholder="Nouvel intitulé..."
          value={newNodeLabel}
          onChange={e => setNewNodeLabel(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleAddNode}
        >
          Ajouter sous "{parentId}"
        </button>
      </div>
      <div ref={containerRef} className="flex-1" />
    </div>
  );
}
