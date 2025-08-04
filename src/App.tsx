import React, { useEffect, useState } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import { fetchGraphData } from './lib/db'
import  {test} from './types/graph'

import type { NodeType, LinkType } from './types/graph'


console.log('TEST:', test)

function App() {
  
  const [graphData, setGraphData] = useState<{
    nodes: NodeType[]
    links: LinkType[]
  }>({ nodes: [], links: [] })

  useEffect(() => {
    async function loadData() {
      const data = await fetchGraphData()
      setGraphData(data)
    }
    loadData()
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ForceGraph3D graphData={graphData} />
    </div>
  )
}

export default App
