import React, { useEffect, useState } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import { fetchGraphData } from './lib/db'
import  {test} from './types/graph'
import InfoPanel from "./components/InfoPanel";

import type { NodeType, LinkType } from './types/graph'


console.log('TEST:', test)

function levelToColor(level: number): string {
  const baseHue = 60;
  const hueStep = 47;
  const hue = (baseHue + level * hueStep) % 360;
  const saturation = 80;
  const lightness = level % 2 === 0 ? 45 : 65;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function App() {
  
  const [graphData, setGraphData] = useState<{
    nodes: NodeType[]
    links: LinkType[]
  }>({ nodes: [], links: [] })

  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());
  

  useEffect(() => {
    async function loadData() {
      const data = await fetchGraphData()
      setGraphData(data)
    }
    loadData()
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ForceGraph3D
        graphData={graphData}
        backgroundColor="#222222"
        linkWidth={(link) => {
          const l = link as LinkType;
          const linkId = `${l.source}|${l.target}`;
          return selectedLinks.has(linkId) ? 6 : 2;
        }}
        
        nodeColor={(node) => {
          const n = node as NodeType;
          return selectedNodes.has(n.id)
            ? 'orange'
            : levelToColor(n.level ?? 0);
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
          const l = link as LinkType;
          const linkId = `${l.source}|${l.target}`;
          return selectedLinks.has(linkId) ? 'orange' : '#999';
        }}        
        onLinkClick={(link) => {
          const l = link as LinkType;
          const linkId = `${l.source}|${l.target}`;
          setSelectedLinks(prev => {
            const newSet = new Set(prev);
            newSet.has(linkId) ? newSet.delete(linkId) : newSet.add(linkId);
            return newSet;
          });
        }}
      />
      <button onClick={() => {
        setSelectedNodes(new Set());
        setSelectedLinks(new Set());
      }}>Tout désélectionner</button>
      <InfoPanel
        selectedNodes={selectedNodes}
        selectedLinks={selectedLinks}
        onClose={() => {
          setSelectedNodes(null);
          setSelectedLinks(null);
        }}
      />
    </div>
  )
}

export default App
