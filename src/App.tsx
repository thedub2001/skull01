import React, { useEffect, useState } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import { fetchGraphData } from './lib/db'
import  {test} from './types/graph'

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

  const [selectedNode, setSelectedNode] = useState<NodeType | null>(null)
  const [selectedLink, setSelectedLink] = useState<LinkType | null>(null)

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
        linkWidth={2}
        nodeColor={(node) => levelToColor((node as NodeType).level ?? 0)}
        onNodeClick={(node) => {
          setSelectedNode(node as NodeType)
          console.log('Node sélectionné :', node)
        }}
        onLinkClick={(link) => {
          setSelectedLink(link as LinkType);
          setSelectedNode(null); // désélectionne le node
          console.log("Lien sélectionné :", link);
        }}
        
      />
      {(selectedNode || selectedLink) && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "300px",
            height: "100%",
            backgroundColor: "#333",
            color: "#fff",
            padding: "1rem",
            overflowY: "auto",
          }}
        >
          <button
            onClick={() => {
              setSelectedNode(null);
              setSelectedLink(null);
            }}
            style={{ float: "right", background: "none", border: "none", color: "#fff" }}
          >
            ✕
          </button>

          {selectedNode && (
            <>
              <h3>Noeud sélectionné</h3>
              <p><strong>ID:</strong> {selectedNode.id}</p>
              <p><strong>Label:</strong> {selectedNode.label}</p>
              <p><strong>Type:</strong> {selectedNode.type}</p>
              <p><strong>Niveau:</strong> {selectedNode.level}</p>
            </>
          )}

          {selectedLink && (() => {
            const source = selectedLink.source as NodeType;
            const target = selectedLink.target as NodeType;

            return (
              <>
                <h3>Lien sélectionné</h3>
                <p><strong>ID:</strong> {selectedLink.id}</p>
                <p><strong>Source:</strong> {source.label} ({source.id})</p>
                <p><strong>Cible:</strong> {target.label} ({target.id})</p>
                <p><strong>Type:</strong> {selectedLink.type}</p>
              </>
            );
          })()}
        </div>
      )}
    
    </div>
  )
}

export default App
