import React, { useEffect, useRef, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { fetchGraphData, fetchVisualLinks } from './lib/db';
import InfoPanel from './components/InfoPanel';
import useLabelSprite from './components/LabelSprite';
import useCameraTracker from './hooks/useCameraTracker';
import { addDynamicVisualLinks } from './utils/addDynamicVisualLinks';

import type { NodeType, LinkType } from './types/graph';
import type { VisualLink } from './utils/addDynamicVisualLinks';

function levelToColor(level: number): string {
  const baseHue = 60;
  const hueStep = 47;
  const hue = (baseHue + level * hueStep) % 360;
  const saturation = 80;
  const lightness = level % 2 === 0 ? 45 : 65;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function App() {
  const [graphData, setGraphData] = useState<{ nodes: NodeType[]; links: LinkType[] }>({ nodes: [], links: [] });
  const [visualLinks, setVisualLinks] = useState<VisualLink[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());

  const fgRef = useRef<any>(null);

  const getLinkId = (l: LinkType) =>
    `${typeof l.source === 'object' ? l.source.id : l.source}|${typeof l.target === 'object' ? l.target.id : l.target}`;

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

  useEffect(() => {
    async function loadData() {
      const data = await fetchGraphData();
      setGraphData(data);
      const vLinks = await fetchVisualLinks();
      setVisualLinks(vLinks);
    }
    loadData();
  }, []);

  const cameraPos = useCameraTracker(fgRef);

  const nodeThreeObject = useLabelSprite({ cameraPos, generateTextLabel });

  const onVisualLinkClick = (linkId: string) => {
    const link = visualLinks.find(l => l.id === linkId);
    if (!link) return;
    setSelectedLinks(prev => {
      const newSet = new Set(prev);
      newSet.has(linkId) ? newSet.delete(linkId) : newSet.add(linkId);
      return newSet;
    });
  };

  useEffect(() => {
    if (!fgRef.current) return;
    addDynamicVisualLinks(fgRef.current, visualLinks, () => selectedLinks, onVisualLinkClick);
  }, [visualLinks, selectedLinks]);
  

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        backgroundColor="#222222"
        linkWidth={(link) => {
          const linkId = getLinkId(link as LinkType);
          return selectedLinks.has(linkId) ? 6 : 2;
        }}
        linkOpacity={1}
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={true}
        nodeColor={(node) => {
          const n = node as NodeType;
          return selectedNodes.has(n.id) ? 'orange' : levelToColor(n.level ?? 0);
        }}
        onNodeClick={(node) => {
          const nodeId = (node as NodeType).id;
          setSelectedNodes(prev => {
            const newSet = new Set(prev);
            newSet.has(nodeId) ? newSet.delete(nodeId) : newSet.add(nodeId);
            return newSet;
          });
        }}
        linkColor={(link) => {
          const id = getLinkId(link as LinkType);
          return selectedLinks.has(id) ? 'orange' : '#aaa';
        }}
        onLinkClick={(link) => {
          const id = getLinkId(link as LinkType);
          setSelectedLinks(prev => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
          });
        }}
      />

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
