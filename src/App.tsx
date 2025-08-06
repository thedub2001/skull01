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
  const getLinkId = (l: LinkType) =>
  `${typeof l.source === 'object' ? l.source.id : l.source}|${typeof l.target === 'object' ? l.target.id : l.target}`;

  

  useEffect(() => {
    async function loadData() {
      const data = await fetchGraphData()
      console.log("Links chargés :", data.links.map(l => l.id))

      setGraphData(data)
    }
    loadData()
  }, [])

// Pour traduire les IDs sélectionnés en objets complets
const selectedNodeObjects = graphData.nodes.filter(n => selectedNodes.has(n.id));
const selectedLinkObjects = graphData.links.filter(l => selectedLinks.has(l.id));

  

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ForceGraph3D
        graphData={graphData}
        backgroundColor="#222222"
        linkWidth={(link) => {
          const linkId = getLinkId(link as LinkType);
          return selectedLinks.has(linkId) ? 6 : 2;
        }}
        linkOpacity={1}
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
          const id = getLinkId(link as LinkType);
          return selectedLinks.has(id) ? 'orange' : '#aaa';
        }}
        onLinkClick={(link) => {
          const id = getLinkId(link as LinkType);
          console.log("Lien cliqué :", id);
          const newSelected = new Set(selectedLinks);
          newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
          setSelectedLinks(newSelected);
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
  )
}

export default App
