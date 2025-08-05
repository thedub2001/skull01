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
      />    
    </div>
  )
}

export default App
